import { getDefaultIfCI } from "../config/get-init.js";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export const GithubInitPr: removeContextCommand<PipesGitHubModule["Context"]["Implement"]["githubInitPr"]> = (
  _context,
  config,
) => {
  const value = getDefaultIfCI();
  if (value) {
    config.githubCurrentPr = value;
    return;
  }
  return;
};
