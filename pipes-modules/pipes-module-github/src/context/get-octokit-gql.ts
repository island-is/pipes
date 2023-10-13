import { z } from "@island.is/pipes-core";
import { graphql } from "@octokit/graphql";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export type GetOctokitGQLInput = undefined;
export type GetOctokitGQLOutput = typeof graphql;
export const GetOctokitGQLParseOutput = z.custom<typeof graphql>();

export const GithubGetOctokitGQL: removeContextCommand<
  PipesGitHubModule["Context"]["Implement"]["githubGetOctokitGQL"]
> = (context, config) => {
  if (!config.githubToken) {
    throw new Error("GitHub token not available");
  }

  if (!context.githubOctokitGQL) {
    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${config.githubToken}`,
      },
    });
    context.githubOctokitGQL = graphqlWithAuth;
  }
  return context.githubOctokitGQL;
};
