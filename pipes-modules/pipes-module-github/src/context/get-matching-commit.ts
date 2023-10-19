/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { z } from "@island.is/pipes-core";

import type { PipesGitHubModule } from "../interface-module.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export const GetMatchingCommitInput = z.object({
  sha: z.string().optional(),
  tagPattern: z.custom<RegExp>((value) => {
    if (value instanceof RegExp) {
      return value;
    }
    throw new Error("invalid regex");
  }),
});

export type GetMatchingCommitInput = z.input<typeof GetMatchingCommitInput>;
export const GetMatchingCommitOutput = z.custom<
  Promise<
    | string
    | {
        sha: string;
        tag: string;
      }
  >
>();
export type GetMatchingCommitOutput = z.infer<typeof GetMatchingCommitOutput>;

type Data = {
  repository: {
    refs: {
      pageInfo: {
        endCursor: string;
        hasNextPage: boolean;
      };
      nodes: {
        name: string;
        target: {
          oid: string;
        };
      }[];
    };
  };
};
export const getMatchingCommit: removeContextCommand<
  PipesGitHubModule["Context"]["Implement"]["githubGetMatchingCommit"]
> = async (context, config, { sha, tagPattern }) => {
  const gql = context.githubGetOctokitGQL();
  const owner = config.githubOwner;
  const repo = config.githubRepo;
  let cursor = sha;
  try {
    while (true) {
      const value = (await gql(
        `
      query getCommit($owner: String!, $repo: String!, $sha: String) {
        repository(owner: $owner, name: $repo) {
          refs(
            refPrefix: "refs/tags/"
            first: 100
            before: $sha
            orderBy: {field: TAG_COMMIT_DATE, direction: DESC}
          ) {
            pageInfo {
              endCursor
              hasNextPage;
              name
              target {
                ... on Commit {
                  oid
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
          sha: cursor,
        },
      )) as unknown as Data;

      if (value.repository.refs.nodes.length === 0) {
        return null;
      }
      const tags = value.repository.refs.nodes;
      for (const tag of tags) {
        if (tagPattern.test(tag.name)) {
          return {
            sha: tag.target.oid,
            tag: tag.name,
          };
        }
      }

      if (value.repository.refs.pageInfo.hasNextPage) {
        cursor = value.repository.refs.pageInfo.endCursor;
      } else {
        return null;
      }
    }
  } catch (_e) {
    return null;
  }
};
