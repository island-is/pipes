import { createContext } from "@island-is/pipes-core";

import { ArtifactUploadSchema } from "../interface.js";
import { ReleaseInput } from "../release.js";

import { GetOctokitParseOutput, GithubGetOctoKit } from "./get-octokit.js";
import { GithubInitPr } from "./init-pr.js";
import { GithubNodePublish, GithubNodePublishParseInput, GithubNodePublishParseOutput } from "./node-publish.js";
import { GithubRelease } from "./release.js";
import { GithubUploadArtifact } from "./upload-artifact.js";
import {
  WriteComment,
  WriteCommentCurrentParseInput,
  WriteCommentCurrentParseOutput,
  WriteCommentParseInput,
  WriteCommentParseOutput,
  WriteCommentToCurrentPR,
} from "./write-comment.js";

import type { GetOctoKitInput, GetOctoKitOutput } from "./get-octokit.js";
import type { GithubNodePublishInput, GithubNodePublishOutput } from "./node-publish.js";
import type {
  WriteCommentCurrentInput,
  WriteCommentCurrentOutput,
  WriteCommentInput,
  WriteCommentOutput,
} from "./write-comment.js";
import type { PipesGitHubModule } from "../interface-module.js";
import type { ArtifactUpload } from "../interface.js";
import type { z } from "@island-is/pipes-core";
import type { Octokit } from "@octokit/rest";

export const GitHubContext: (prop: any) => PipesGitHubModule["Context"]["Implement"] = createContext<PipesGitHubModule>(
  ({ z, fn }): PipesGitHubModule["Context"]["Implement"] => ({
    /** Publish to npm registry on github */
    githubNodePublish: fn<GithubNodePublishInput, GithubNodePublishOutput>({
      value: GithubNodePublishParseInput,
      output: GithubNodePublishParseOutput,
      implement: GithubNodePublish,
    }),
    /** Initialize default git config */
    githubInitPr: fn<undefined, void>({
      implement: GithubInitPr,
    }),
    githubOctokit: z.optional(z.custom<Octokit>()),
    githubGetOctokit: fn<GetOctoKitInput, GetOctoKitOutput>({
      output: GetOctokitParseOutput,
      implement: GithubGetOctoKit,
    }),
    githubWriteCommentToCurrentPr: fn<WriteCommentCurrentInput, WriteCommentCurrentOutput>({
      value: WriteCommentCurrentParseInput,
      output: WriteCommentCurrentParseOutput,
      implement: WriteCommentToCurrentPR,
    }),
    githubWriteCommentToPR: fn<WriteCommentInput, WriteCommentOutput>({
      value: WriteCommentParseInput,
      output: WriteCommentParseOutput,
      implement: WriteComment,
    }),
    githubUploadArtifact: fn<ArtifactUpload, Promise<void>>({
      value: ArtifactUploadSchema,
      output: z.custom<Promise<void>>(),
      implement: GithubUploadArtifact,
    }),
    githubRelease: fn<z.input<typeof ReleaseInput>, Promise<void>>({
      value: ReleaseInput,
      output: z.custom<Promise<void>>(),
      implement: GithubRelease,
    }),
  }),
);
