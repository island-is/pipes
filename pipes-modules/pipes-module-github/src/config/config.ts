import { createConfig, z } from "@island-is/pipes-core";

import { githubPRUrls, githubRepository, githubUserschema } from "../schemas.js";

import { getDefaultIfCI } from "./get-init.js";

import type { PipesGitHubModule } from "../interface-module.js";

const currentGithubPR = await getDefaultIfCI();

const GITHUB_REPOSITORY = z
  .string()
  .default(undefined, {
    arg: {
      long: "githubRepository",
    },
    env: "GITHUB_REPOSITORY",
  })
  .describe(`Default Github repository in format owner/repo`)
  .optional()
  .parse();

const GITHUB_OWNER = z
  .string()
  .default(GITHUB_REPOSITORY ? GITHUB_REPOSITORY.split("/")[0] : undefined, {
    arg: {
      long: "githubOwner",
    },
    env: "PIPES_GITHUB_REPO_OWNER",
  })
  .describe("Default owner of repo")
  .optional()
  .parse();
const GITHUB_REPO = z
  .string()
  .default(GITHUB_REPOSITORY ? GITHUB_REPOSITORY.split("/")[1] : undefined, {
    arg: {
      long: "githubRepo",
    },
    env: "PIPES_GITHUB_REPO",
  })
  .describe("Default repo")
  .optional()
  .parse();

const GITHUB_TOKEN = z
  .string()
  .default(undefined, {
    arg: {
      long: "githubToken",
    },
    env: "GITHUB_TOKEN",
  })
  .describe("Default Github token")
  .optional()
  .parse();

export const GitHubConfig = createConfig<PipesGitHubModule>(({ z }) => ({
  githubCommitSHA: z
    .string()
    .default(undefined, {
      arg: {
        long: "githubSHA",
      },
      env: "GITHUB_SHA",
    })
    .describe("Default SHA being worked on"),
  githubToken: z.string().default(GITHUB_TOKEN),
  githubOwner: z.string().default(GITHUB_OWNER),
  githubRepo: z.string().default(GITHUB_REPO),
  githubCurrentPr: z.optional(
    z
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
      .default(currentGithubPR || undefined),
  ),
}));
