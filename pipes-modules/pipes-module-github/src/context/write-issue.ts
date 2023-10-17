import { z } from "@island.is/pipes-core";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export const WriteIssueParseInput = z.object({ title: z.string(), body: z.string() });
export const WriteIssueParseOutput = z.promise(z.object({ id: z.number(), url: z.string() }));

export type WriteIssueInput = z.input<typeof WriteIssueParseInput>;
export type WriteIssueOutput = z.infer<typeof WriteIssueParseOutput>;

export const WriteIssue: removeContextCommand<PipesGitHubModule["Context"]["Implement"]["githubWriteIssue"]> = async (
  context,
  config,
  { body, title },
) => {
  const owner = config.githubOwner;
  const repo = config.githubRepo;

  const issue = await context.githubGetOctokit().rest.issues.create({
    owner,
    repo,
    body,
    title,
  });
  return { id: issue.data.id, url: issue.data.html_url };
};
