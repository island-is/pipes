import { type removeContextCommand, z } from "@island.is/pipes-core";

import type { PipesGitHubModule } from "../interface-module.js";

type CommitData = {
  repository: {
    object: {
      history: {
        pageInfo: {
          endCursor: string;
          hasNextPage: boolean;
        };
        edges: {
          node: {
            oid: string;
            message: string;
            messageBody: string;
          };
        }[];
      };
    };
  };
};

// Input
export const GetCommitsBetweenInput = z.object({
  startSha: z.string(),
  endSha: z.string(),
});

export type GetCommitsBetweenInput = z.input<typeof GetCommitsBetweenInput>;

// Output
export const CommitObject = z.object({
  sha: z.string(),
  commit: z.string(),
  commitBody: z.string(),
});

export const GetCommitsBetweenOutput = z.array(CommitObject).promise();

export type GetCommitsBetweenOutput = z.infer<typeof GetCommitsBetweenOutput>;

export const githubGetCommitsBetween: removeContextCommand<
  PipesGitHubModule["Context"]["Implement"]["githubGetCommitsBetween"]
> = async (context, config, { startSha, endSha }) => {
  const gql = context.githubGetOctokitGQL();
  const owner = config.githubOwner;
  const repo = config.githubRepo;
  let cursor: string | undefined = undefined;
  const result: { sha: string; commit: string; commitBody: string }[] = [];

  try {
    while (true) {
      const data: CommitData = await gql(
        // eslint-disable-next-line max-len
        `query getCommitsBetween($owner: String!, $repo: String!, $endSha: GitObjectID!, $startSha: String!, $cursor: String) {
            repository(owner: $owner, name: $repo) {
              object(oid: $endSha) {
                ... on Commit {
                  history(first: 100, before: $startSha, after: $cursor) {
                    pageInfo {
                      endCursor
                      hasNextPage
                    }
                    edges {
                      node {
                        oid
                        message
                        messageBody
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        {
          owner,
          repo,
          startSha,
          endSha,
          cursor,
        },
      );

      data.repository.object.history.edges.forEach((edge) => {
        result.push({
          sha: edge.node.oid,
          commit: edge.node.message,
          commitBody: edge.node.messageBody,
        });
      });

      if (data.repository.object.history.pageInfo.hasNextPage) {
        cursor = data.repository.object.history.pageInfo.endCursor;
      } else {
        break;
      }
    }

    return result;
  } catch (error) {
    console.error(error);
    return result;
  }
};
