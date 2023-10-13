import { z } from "@island.is/pipes-core";
import { Octokit } from "@octokit/rest";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export type GetOctoKitInput = undefined;
export type GetOctoKitOutput = Octokit;
export const GetOctokitParseOutput = z.custom<Octokit>((value) => {
  if (value instanceof Octokit) {
    return value;
  }
  throw new Error(`Invalid octokit value`);
});

export const GithubGetOctoKit: removeContextCommand<PipesGitHubModule["Context"]["Implement"]["githubGetOctokit"]> = (
  context,
  config,
) => {
  if (!config.githubToken) {
    throw new Error("GitHub token not available");
  }

  if (!context.githubOctokit) {
    context.githubOctokit = new Octokit({ auth: config.githubToken });
  }
  return context.githubOctokit;
};
