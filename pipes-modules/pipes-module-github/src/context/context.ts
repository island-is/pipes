import { type Directory, createContext } from "@island.is/pipes-core";

import {
  GithubApprovePR,
  type GithubApprovePRInput,
  type GithubApprovePROutput,
  GithubApprovePRParseInput,
  GithubApprovePRParseOutput,
} from "./approve-pr.js";
import {
  GithubEnableAutoMergePR,
  GithubEnableAutoMergePRParseInput,
  GithubEnableAutoMergePRParseOutput,
} from "./enable-auto-merge-pr.js";
import { GetCommitsBetweenInput, GetCommitsBetweenOutput, githubGetCommitsBetween } from "./get-commits-between.js";
import { GetMatchingCommitInput, GetMatchingCommitOutput, getMatchingCommit } from "./get-matching-commit.js";
import { GetOctokitGQLParseOutput, GithubGetOctokitGQL } from "./get-octokit-gql.js";
import { GetOctokitParseOutput, GithubGetOctokit } from "./get-octokit.js";
import { GithubInitPr } from "./init-pr.js";
import { GithubNodePublish, GithubNodePublishParseInput, GithubNodePublishParseOutput } from "./node-publish.js";
import { GithubRelease } from "./release.js";
import { GithubUploadArtifact, UploadArtifactSchema } from "./upload-artifact.js";
import {
  WriteComment,
  WriteCommentCurrentParseInput,
  WriteCommentCurrentParseOutput,
  WriteCommentParseInput,
  WriteCommentParseOutput,
  WriteCommentToCurrentPR,
} from "./write-comment.js";
import { WriteIssue, WriteIssueParseInput, WriteIssueParseOutput } from "./write-issue.js";

import type { GithubEnableAutoMergePRInput, GithubEnableAutoMergePROutput } from "./enable-auto-merge-pr.js";
import type { GetOctokitGQLInput, GetOctokitGQLOutput } from "./get-octokit-gql.js";
import type { GetOctokitInput, GetOctokitOutput } from "./get-octokit.js";
import type { GithubNodePublishInput, GithubNodePublishOutput } from "./node-publish.js";
import type {
  WriteCommentCurrentInput,
  WriteCommentCurrentOutput,
  WriteCommentInput,
  WriteCommentOutput,
} from "./write-comment.js";
import type { WriteIssueInput, WriteIssueOutput } from "./write-issue.js";
import type { PipesGitHubModule } from "../interface-module.js";
import type { graphql } from "@octokit/graphql";
import type { Octokit } from "@octokit/rest";

export const GitHubContext: (prop: any) => PipesGitHubModule["Context"]["Implement"] = createContext<PipesGitHubModule>(
  ({ z, fn }): PipesGitHubModule["Context"]["Implement"] => ({
    githubGetCommitsBetween: fn<GetCommitsBetweenInput, GetCommitsBetweenOutput>({
      value: GetCommitsBetweenInput,
      output: GetCommitsBetweenOutput,
      implement: githubGetCommitsBetween,
    }),
    githubGetMatchingCommit: fn<GetMatchingCommitInput, GetMatchingCommitOutput>({
      value: GetMatchingCommitInput,
      output: GetMatchingCommitOutput,
      implement: getMatchingCommit,
    }),
    githubWriteIssue: fn<WriteIssueInput, WriteIssueOutput>({
      value: WriteIssueParseInput,
      output: WriteIssueParseOutput,
      implement: WriteIssue,
    }),
    githubApprovePR: fn<GithubApprovePRInput, GithubApprovePROutput>({
      value: GithubApprovePRParseInput,
      output: GithubApprovePRParseOutput,
      implement: GithubApprovePR,
    }),
    githubEnableAutoMergePR: fn<GithubEnableAutoMergePRInput, GithubEnableAutoMergePROutput>({
      value: GithubEnableAutoMergePRParseInput,
      output: GithubEnableAutoMergePRParseOutput,
      implement: GithubEnableAutoMergePR,
    }),
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
    githubOctokitGQL: z.optional(z.custom<typeof graphql>()),
    githubGetOctokitGQL: fn<GetOctokitGQLInput, GetOctokitGQLOutput>({
      output: GetOctokitGQLParseOutput,
      implement: GithubGetOctokitGQL,
    }),
    githubGetOctokit: fn<GetOctokitInput, GetOctokitOutput>({
      output: GetOctokitParseOutput,
      implement: GithubGetOctokit,
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
    githubUploadArtifact: fn<{ version: string; name: string; files: Directory }, Promise<void>>({
      value: UploadArtifactSchema,
      output: z.custom<Promise<void>>(),
      implement: GithubUploadArtifact,
    }),
    githubRelease: fn<{ version: string; body?: string | undefined }, Promise<void>>({
      value: z.object({ version: z.string(), body: z.string().optional() }),
      output: z.custom<Promise<void>>(),
      implement: GithubRelease,
    }),
  }),
);
