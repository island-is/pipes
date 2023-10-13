import { z } from "@island.is/pipes-core";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export const GithubApprovePRParseInput = z.object({
  pullNumber: z.number().optional(),
  body: z.string().optional().default("Auto accepted"),
});

export type GithubApprovePRInput = z.input<typeof GithubApprovePRParseInput>;
export const GithubApprovePRParseOutput = z.custom<Promise<void>>();
export type GithubApprovePROutput = z.infer<typeof GithubApprovePRParseOutput>;
export const GithubApprovePR: removeContextCommand<
  PipesGitHubModule["Context"]["Implement"]["githubApprovePR"]
> = async (context, config, props) => {
  const octokit = context.githubGetOctokit();
  if (!props.pullNumber) {
    context.githubInitPr();
  }
  const pull_number = props.pullNumber ?? config.githubCurrentPr?.number;
  const event: "APPROVE" = "APPROVE";
  const owner = config.githubOwner;
  const repo = config.githubRepo;
  const body = props.body ?? "Auto approved";
  if (!pull_number) {
    throw new Error(`PR not set`);
  }

  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    event,
    body,
  });
};
