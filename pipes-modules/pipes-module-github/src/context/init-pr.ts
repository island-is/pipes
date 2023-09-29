import { getDefaultIfCI } from "../config/get-init.js";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island-is/pipes-core";

export const GithubInitPr: removeContextCommand<PipesGitHubModule["Context"]["Implement"]["githubInitPr"]> = (
  _context,
  config,
) => {
  const value = getDefaultIfCI();
  if (value) {
    config.githubToken = process.env.GITHUB_TOKEN ?? "";
    config.githubOwner = (process.env.GITHUB_REPOSITORY ?? "").split("/")[0];
    config.githubRepo = (process.env.GITHUB_REPOSITORY ?? "").split("/")[1];
    config.githubCurrentPr = value;
    return;
  }
  throw new Error("Could not set config");
};
