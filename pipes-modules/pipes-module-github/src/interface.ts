import { z } from "@island-is/pipes-core";

import { ArtifactSchema } from "./artifact.js";
import { ReleaseInput } from "./release.js";

export type GithubUser = {
  login: string;
};

export type GithubRepository = {
  fullName: string;
  name: string;
  owner: GithubUser;
};

export type GithubPRUrls = {
  htmlUrl: string;
  commentsUrl: string;
};

export type GithubPR = {
  name: string;
  number: number;
  action: string;
  sourceBranch: string;
  targetBranch: string;
  initiator: GithubUser;
  repository: GithubRepository;
  urls: GithubPRUrls;
} | null;

export type ReleaseInput = z.input<typeof ReleaseInput>;
export type ReleaseBaseInput = Pick<z.input<typeof ReleaseInput>, "owner" | "repo" | "tag">;
export type ArtifactInput = z.input<typeof ArtifactSchema>;
export type ArtifactUpload = { release: ReleaseBaseInput; artifact: ArtifactInput };
export const ArtifactUploadSchema = z.object({
  release: ReleaseInput.pick({ owner: true, tag: true, repo: true }),
  artifact: ArtifactSchema,
});
