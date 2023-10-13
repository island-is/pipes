import { z } from "@island.is/pipes-core";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export type WriteCommentCurrentInput = { comment: string };
export type WriteCommentCurrentOutput = Promise<void>;
export const WriteCommentCurrentParseInput = z.object({ comment: z.string() });
export const WriteCommentCurrentParseOutput = z.custom<WriteCommentOutput>();

export type WriteCommentInput = WriteCommentCurrentInput & { prNumber: number };
export type WriteCommentOutput = WriteCommentCurrentOutput;
export const WriteCommentParseInput = WriteCommentCurrentParseInput.extend({ prNumber: z.number() });
export const WriteCommentParseOutput = WriteCommentCurrentParseOutput;

export const WriteComment: removeContextCommand<
  PipesGitHubModule["Context"]["Implement"]["githubWriteCommentToPR"]
> = async (context, config, { comment, prNumber }) => {
  const owner = config.githubOwner;
  const repo = config.githubRepo;

  await context.githubGetOctokit().rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: comment,
  });
};

export const WriteCommentToCurrentPR: removeContextCommand<
  PipesGitHubModule["Context"]["Implement"]["githubWriteCommentToCurrentPr"]
> = async (context, config, { comment }) => {
  if (!config.githubCurrentPr?.number) {
    throw new Error("Current PR info not available");
  }
  await context.githubWriteCommentToPR({ prNumber: config.githubCurrentPr.number, comment });
};
