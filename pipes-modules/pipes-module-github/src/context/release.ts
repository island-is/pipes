import { GithubRelease as GithubReleaseAction } from "../release.js";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island-is/pipes-core";

export const GithubRelease: removeContextCommand<PipesGitHubModule["Context"]["Implement"]["githubRelease"]> = async (
  context,
  _config,
  props,
) => {
  const octokit = context.githubGetOctokit();
  await GithubReleaseAction.process(props, octokit);
};
