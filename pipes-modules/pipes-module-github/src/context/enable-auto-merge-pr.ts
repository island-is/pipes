import { z } from "@island.is/pipes-core";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export const GithubEnableAutoMergePRParseInput = z.object({
  pullNumber: z.number().optional(),
});

export type GithubEnableAutoMergePRInput = z.input<typeof GithubEnableAutoMergePRParseInput>;
export const GithubEnableAutoMergePRParseOutput = z.custom<Promise<void>>();
export type GithubEnableAutoMergePROutput = z.infer<typeof GithubEnableAutoMergePRParseOutput>;

type Data = {
  repository: {
    pullRequest: {
      id: string;
    };
  };
};
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

  const value = await gql(
    `query getPR($repo: String!, $owner: String!, $id: Int!) {
      repository(name: $repo, owner: $owner) {
        pullRequest(number: $id) {
          id
        }
      }
    }`,
    {
      repo: config.githubRepo,
      owner: config.githubOwner,
      id: pull_number,
    },
  );

  const id = (value as Data)?.repository?.pullRequest?.id;
  if (!id) {
    throw new Error("Invalid id");
  }
  await gql(
    `
  mutation EnableAutoMerge($pullRequestId: ID!) {
    enablePullRequestAutoMerge(input: { pullRequestId: $pullRequestId }) {
      clientMutationId
    }
  }
  `,
    { pullRequestId: id },
  );
};
