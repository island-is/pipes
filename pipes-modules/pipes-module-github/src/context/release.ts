import { GithubRelease as GithubReleaseAction } from "../release.js";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export const GithubRelease: removeContextCommand<PipesGitHubModule["Context"]["Implement"]["githubRelease"]> = async (
  context,
  config,
  props,
) => {
  const owner = config.githubOwner;
  const repo = config.githubRepo;
  const octokit = context.githubGetOctokit();
  const body: { body: string } | Record<string, never> = props.body ? { body: props.body } : {};
  await GithubReleaseAction.process(
    {
      ...body,
      owner,
      repo,
      artifactState: "leaveAlone",
      tag: `v${props.version}`,
      name: props.version,
      targetCommitish: config.githubCommitSHA,
    },
    octokit,
  );
};
