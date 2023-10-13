import { z } from "@island.is/pipes-core";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export const GithubEnableAutoMergePRParseInput = z.object({
  pullNumber: z.number().optional(),
});

export type GithubEnableAutoMergePRInput = z.input<typeof GithubEnableAutoMergePRParseInput>;
export const GithubEnableAutoMergePRParseOutput = z.custom<Promise<void>>();
export type GithubEnableAutoMergePROutput = z.infer<typeof GithubEnableAutoMergePRParseOutput>;
export const GithubEnableAutoMergePR: removeContextCommand<
  PipesGitHubModule["Context"]["Implement"]["githubEnableAutoMergePR"]
> = async (context, config, props) => {
  const gql = context.githubGetOctokitGQL();
  if (!props.pullNumber) {
    context.githubInitPr();
  }
  const pull_number = props.pullNumber ?? config.githubCurrentPr?.number;

  if (!pull_number) {
    throw new Error(`PR not set`);
  }

  await gql(
    `
  mutation EnableAutoMerge($pullRequestId: ID!) {
    enablePullRequestAutoMerge(input: { pullRequestId: $pullRequestId }) {
      clientMutationId
    }
  }
  `,
    { pullRequestId: pull_number },
  );
};
