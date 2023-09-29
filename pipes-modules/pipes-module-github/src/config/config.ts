import { createConfig } from "@island-is/pipes-core";

import { githubPRUrls, githubRepository, githubUserschema } from "../schemas.js";

import type { PipesGitHubModule } from "../interface-module.js";

export const GitHubConfig = createConfig<PipesGitHubModule>(({ z }) => ({
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
