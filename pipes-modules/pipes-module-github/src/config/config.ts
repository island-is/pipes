import { createConfig } from "@island-is/pipes-core";

import { githubPRUrls, githubRepository, githubUserschema } from "../schemas.js";

import { getDefaultIfCI } from "./get-init.js";

import type { PipesGitHubModule } from "../interface-module.js";

const values = await getDefaultIfCI();
export const GitHubConfig = createConfig<PipesGitHubModule>(({ z }) => ({
  githubCommitSHA: z.string().default(undefined, {
    env: "GITHUB_SHA",
  }),
  githubToken: z.string().default(undefined, { env: "GITHUB_TOKEN" }),
  githubOwner: z.string().default(process.env.GITHUB_REPOSITORY?.split("/")[0] ?? "", {
    env: "PIPES_GITHUB_OWNER",
  }),
  githubRepo: z.string().default(process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "", {
    env: "PIPES_GITHUB_REPO",
  }),
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
      .default(values || undefined),
  ),
}));
