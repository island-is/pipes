import { GithubRelease } from "../release.js";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island-is/pipes-core";

export const GithubUploadArtifact: removeContextCommand<
  PipesGitHubModule["Context"]["Implement"]["githubUploadArtifact"]
> = async (context, config, props) => {
  const octokit = context.githubGetOctokit();
  await GithubRelease.process(
    {
      state: "only_upload_artifacts",
      artifactState: "update",
      artifacts: [props.artifact],
      ...props.release,
    },
    octokit,
  );
};
