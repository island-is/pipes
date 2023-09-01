import fsSync from "node:fs";

import {
  type PipesCoreModule,
  type Simplify,
  createConfig,
  createContext,
  createModule,
  type createModuleDef,
  z,
} from "@island.is/pipes-core";
import { Octokit } from "@octokit/rest";

type GithubUser = {
  login: string;
};

type GithubRepository = {
  fullName: string;
  name: string;
  owner: GithubUser;
};

type GithubPRUrls = {
  htmlUrl: string;
  commentsUrl: string;
};

type GithubPR = {
  name: string;
  number: number;
  action: string;
  sourceBranch: string;
  targetBranch: string;
  initiator: GithubUser;
  repository: GithubRepository;
  urls: GithubPRUrls;
} | null;

interface IGitHubConfig {
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  githubCurrentPr: GithubPR;
}

interface IGitHubContext {
  githubDeleteMergedBranch: (prop: { branchName: string }) => Promise<void>;
  githubDeleteCurrentMergedBranch: () => Promise<void>;
  githubInitPr: () => void;
  githubOctokit: Octokit | null;
  githubMergePR: (prop: { prNumber: number }) => Promise<void>;
  githubMergeCurrentPR: () => Promise<void>;
  githubGetOctokit: () => Octokit;
  githubWriteCommentToPR: (prop: { prNumber: number; comment: string }) => Promise<void>;
  githubAddTagToPR: (prop: { prNumber: number; tagName: string }) => Promise<void>;
  githubRemoveTagToPR: (prop: { prNumber: number; tagName: string }) => Promise<void>;
  githubAddTagToCurrentPr: (prop: { tagName: string }) => Promise<void>;
  githubRemoveTagFromCurrentPr: (prop: { tagName: string }) => Promise<void>;
  githubWriteCommentToCurrentPr: (prop: { comment: string }) => Promise<void>;
  githubAllChecksPassed: (prop: { prNumber: number }) => Promise<boolean>;
  githubAllChecksPassedCurrentPR: () => Promise<boolean>;
}

export type PipesGitHubModule = createModuleDef<"PipesGitHub", IGitHubContext, IGitHubConfig, [PipesCoreModule]>;

const githubUserschema = z.object({ login: z.string() }).default({ login: "" });
const githubRepository = z
  .object({
    fullName: z.string(),
    name: z.string(),
    owner: githubUserschema,
  })
  .default({
    fullName: "",
    name: "",
    owner: {
      login: "",
    },
  });
const githubPRUrls = z
  .object({
    htmlUrl: z.string(),
    commentsUrl: z.string(),
  })
  .default({
    htmlUrl: "",
    commentsUrl: "",
  });

const getDefaultIfCI = (): IGitHubConfig["githubCurrentPr"] | undefined => {
  // Check if running in a GitHub Actions environment
  if (process.env.CI !== "true" || !process.env.GITHUB_EVENT_PATH) {
    return undefined;
  }

  // Read the GitHub Actions event payload
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const eventData = JSON.parse(fsSync.readFileSync(eventPath, "utf8"));
  if (!eventData.pull_request) {
    return undefined;
  }

  const prData = eventData.pull_request;
  const repositoryData = eventData.repository;
  const actionData = eventData.action;

  const value: IGitHubConfig["githubCurrentPr"] = {
    name: repositoryData.full_name as string,
    number: prData.number as number,
    action: actionData as string,
    sourceBranch: prData.head.ref as string,
    targetBranch: prData.base.ref as string,
    initiator: {
      login: prData.user.login as string,
    },
    repository: {
      fullName: repositoryData.full_name as string,
      name: repositoryData.name as string,
      owner: {
        login: repositoryData.owner.login as string,
      },
    },
    urls: {
      htmlUrl: prData.html_url as string,
      commentsUrl: prData.comments_url as string,
    },
  };
  // Test parsing
  const parsed = z
    .object({
      name: z.string(),
      number: z.number(),
      action: z.string(),
      sourceBranch: z.string(),
      targetBranch: z.string(),
      initiator: githubUserschema,
      repository: githubRepository,
      urls: githubPRUrls,
    })
    .strict()
    .safeParse(value);
  return parsed.success ? parsed.data : undefined;
};
const GitHubConfig = createConfig<PipesGitHubModule>(({ z }) => ({
  githubToken: z.string().default(process.env.GITHUB_TOKEN ?? ""),
  githubOwner: z.string().default(process.env.GITHUB_REPOSITORY?.split("/")[0] ?? ""),
  githubRepo: z.string().default(process.env.GITHUB_REPOSITORY?.split("/")[1] ?? ""),
  githubCurrentPr: z.optional(
    z.object({
      name: z.string(),
      number: z.number(),
      action: z.string(),
      sourceBranch: z.string(),
      targetBranch: z.string(),
      initiator: githubUserschema,
      repository: githubRepository,
      urls: githubPRUrls,
    }),
  ),
}));

const GitHubContext = createContext<PipesGitHubModule>(({ z, fn }): PipesGitHubModule["Context"]["Implement"] => ({
  githubDeleteMergedBranch: fn<{ branchName: string }, Promise<void>>({
    value: z.object({ branchName: z.string() }),
    output: z.custom<Promise<void>>(),
    implement: async (context, config, { branchName }) => {
      const owner = config.githubOwner;
      const repo = config.githubRepo;

      const octokit = context.githubGetOctokit();

      await octokit.rest.git.deleteRef({
        owner,
        repo,
        ref: `heads/${branchName}`,
      });
    },
  }),

  // Function to delete the branch of the current PR if it is merged
  githubDeleteCurrentMergedBranch: fn<undefined, Promise<void>>({
    output: z.custom<Promise<void>>(),
    implement: async (context, config) => {
      if (!config.githubCurrentPr?.sourceBranch) {
        throw new Error("Current PR info not available");
      }
      await context.githubDeleteMergedBranch({ branchName: config.githubCurrentPr.sourceBranch });
    },
  }),
  githubAllChecksPassed: fn<{ prNumber: number }, Promise<boolean>>({
    value: z.object({ prNumber: z.number() }),
    output: z.custom<Promise<boolean>>((val) => val),
    implement: async (context, config, { prNumber }) => {
      const owner = config.githubOwner;
      const repo = config.githubRepo;

      const octokit = context.githubGetOctokit();
      const { data: prData } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      const { data: checkRuns } = await octokit.rest.checks.listForRef({
        owner,
        repo,
        ref: prData.head.sha,
      });

      return checkRuns.check_runs.every((run) => run.conclusion === "success");
    },
  }),
  githubAllChecksPassedCurrentPR: fn<undefined, Promise<boolean>>({
    output: z.custom<Promise<boolean>>(),
    implement: (context, config) => {
      if (!config.githubCurrentPr?.number) {
        throw new Error("Current PR info not available");
      }
      return context.githubAllChecksPassed({ prNumber: config.githubCurrentPr.number });
    },
  }),
  githubInitPr: fn<undefined, void>({
    implement: (_context, config) => {
      const value = getDefaultIfCI();
      if (value) {
        config.githubToken = process.env.GITHUB_TOKEN ?? "";
        config.githubOwner = (process.env.GITHUB_REPOSITORY ?? "").split("/")[0];
        config.githubRepo = (process.env.GITHUB_REPOSITORY ?? "").split("/")[1];
        config.githubCurrentPr = value;
        return;
      }
      throw new Error("Could not set config");
    },
  }),
  githubOctokit: z.optional(z.custom<Octokit>()),
  githubGetOctokit: fn<undefined, Octokit>({
    output: z.custom<Octokit>(),
    implement: (context, config) => {
      if (!config.githubToken) {
        throw new Error("GitHub token not available");
      }

      if (!context.githubOctokit) {
        context.githubOctokit = new Octokit({ auth: config.githubToken });
      }
      return context.githubOctokit;
    },
  }),

  githubWriteCommentToPR: fn<{ prNumber: number; comment: string }, Promise<void>>({
    value: z.object({
      prNumber: z.number(),
      comment: z.string(),
    }),
    output: z.custom<Promise<void>>((val) => val),
    implement: async (context, config, { prNumber, comment }) => {
      const owner = config.githubOwner;
      const repo = config.githubRepo;

      await context.githubGetOctokit().rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: comment,
      });
    },
  }),
  githubGetTagsFromPR: fn<{ prNumber: number }, Promise<void>>({
    value: z.object({
      prNumber: z.number(),
    }),
    output: z.custom<Promise<void>>((val) => val),
    implement: async (context, config, { prNumber, tagName }) => {
      const owner = config.githubOwner;
      const repo = config.githubRepo;

      const value = await context.githubGetOctokit().rest.issues.listLabelsOnIssue({
        owner,
        repo,
        issue_number: prNumber,
        name: tagName,
      });
    },
  }),
  githubRemoveTagToPR: fn<{ prNumber: number; tagName: string }, Promise<void>>({
    value: z.object({
      prNumber: z.number(),
      tagName: z.string(),
    }),
    output: z.custom<Promise<void>>((val) => val),
    implement: async (context, config, { prNumber, tagName }) => {
      const owner = config.githubOwner;
      const repo = config.githubRepo;

      await context.githubGetOctokit().rest.issues.removeLabel({
        owner,
        repo,
        issue_number: prNumber,
        name: tagName,
      });
    },
  }),
  githubAddTagToPR: fn<{ prNumber: number; tagName: string }, Promise<void>>({
    value: z.object({
      prNumber: z.number(),
      tagName: z.string(),
    }),
    output: z.custom<Promise<void>>((val) => val),
    implement: async (context, config, { prNumber, tagName }) => {
      const owner = config.githubOwner;
      const repo = config.githubRepo;

      await context.githubGetOctokit().rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: [tagName],
      });
    },
  }),
  githubAddTagToCurrentPr: fn<{ tagName: string }, Promise<void>>({
    value: z.object({ tagName: z.string() }),
    output: z.custom<Promise<void>>(),
    implement: async (context, config, { tagName }) => {
      if (!config.githubCurrentPr?.number) {
        throw new Error("Current PR info not available");
      }
      await context.githubAddTagToPR({ prNumber: config.githubCurrentPr.number, tagName });
    },
  }),

  githubRemoveTagFromCurrentPr: fn<{ tagName: string }, Promise<void>>({
    value: z.object({ tagName: z.string() }),
    output: z.custom<Promise<void>>(),
    implement: async (context, config, { tagName }) => {
      if (!config.githubCurrentPr?.number) {
        throw new Error("Current PR info not available");
      }
      await context.githubRemoveTagToPR({ prNumber: config.githubCurrentPr.number, tagName });
    },
  }),

  githubWriteCommentToCurrentPr: fn<{ comment: string }, Promise<void>>({
    value: z.object({ comment: z.string() }),
    output: z.custom<Promise<void>>(),
    implement: async (context, config, { comment }) => {
      if (!config.githubCurrentPr?.number) {
        throw new Error("Current PR info not available");
      }
      await context.githubWriteCommentToPR({ prNumber: config.githubCurrentPr.number, comment });
    },
  }),
  githubMergePR: fn<{ prNumber: number }, Promise<void>>({
    value: z.object({
      prNumber: z.number(),
    }),
    output: z.custom<Promise<void>>(),
    implement: async (context, config, { prNumber }) => {
      const owner = config.githubOwner;
      const repo = config.githubRepo;

      await context.githubGetOctokit().rest.pulls.merge({
        owner,
        repo,
        pull_number: prNumber,
        merge_method: "squash",
      });
    },
  }),
  githubMergeCurrentPR: fn<undefined, Promise<void>>({
    output: z.custom<Promise<void>>(),
    implement: async (context, config) => {
      if (!config.githubCurrentPr?.number) {
        throw new Error("Current PR info not available");
      }
      await context.githubMergePR({ prNumber: config.githubCurrentPr.number });
    },
  }),
}));

export const PipesGitHub: {
  name: "PipesGitHub";
  config: Simplify<PipesGitHubModule["Config"]["Implement"]>;
  context: Simplify<PipesGitHubModule["Context"]["Implement"]>;
  required: "PipesCore"[];
  optional: [];
} = createModule<PipesGitHubModule>({
  name: "PipesGitHub",
  config: GitHubConfig,
  context: GitHubContext,
  required: ["PipesCore"],
  optional: [],
});
