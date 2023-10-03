import { rmSync } from "node:fs";
import { readFile } from "node:fs/promises";

import { Directory, onCleanup, type removeContextCommand, z } from "@island-is/pipes-core";
import { dir, file } from "tmp-promise";
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
  const { path } = await dir();
  const { path: zipPath } = await file({ postfix: ".zip", prefix: `artifact-${props.version}-` });
  const cleanup = onCleanup(() => {
    rmSync(path, { recursive: true, force: true });
  });
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
  cleanup();
};
