import { readFile } from "node:fs/promises";

import { Directory, type removeContextCommand, tmpDir, tmpFile, z } from "@island-is/pipes-core";
import { zip } from "zip-a-folder";

import { GithubRelease } from "../release.js";

import type { PipesGitHubModule } from "../interface-module.js";

export const UploadArtifactSchema = z.object({
  version: z.string(),
  name: z.string(),
  files: z.custom<Directory>((value) => {
    if (value instanceof Directory) {
      return value;
    }
    throw new Error(`Invalid file`);
  }),
});

export const GithubUploadArtifact: removeContextCommand<
  PipesGitHubModule["Context"]["Implement"]["githubUploadArtifact"]
> = async (context, config, props) => {
  const octokit = context.githubGetOctokit();
  await using _tmpDir = await tmpDir({ unsafeCleanup: true });
  const path = _tmpDir.path;
  await using _tmpZip = await tmpFile({ postfix: ".zip", prefix: `artifact-${props.version}-` });
  const zipPath = _tmpZip.path;

  const owner = config.githubOwner;
  const repo = config.githubRepo;
  await props.files.export(path);
  await zip(path, zipPath);
  const buffer = await readFile(zipPath);
  await GithubRelease.process(
    {
      owner,
      repo,
      state: "only_upload_artifacts",
      artifactState: "update",
      artifacts: [{ name: `${props.name}.zip`, data: buffer }],
      tag: `v${props.version}`,
      name: props.version,
      targetCommitish: config.githubCommitSHA,
    },
    octokit,
  );
};
