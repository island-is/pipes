import fsSync from "node:fs";

import { z } from "@island.is/pipes-core";

import { githubPRUrls, githubRepository, githubUserschema } from "../schemas.js";

import type { IGitHubConfig } from "../interface-config.js";

export const getDefaultIfCI = (): IGitHubConfig["githubCurrentPr"] | undefined => {
  // Check if running in a GitHub Actions environment
  if (process.env.CI !== "true" || !process.env.GITHUB_EVENT_PATH) {
    return undefined;
  }

  // Read the GitHub Actions event payload
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const eventData = JSON.parse(fsSync.readFileSync(eventPath, "utf8"));
  if (!eventData.pull_request) {
    return undefined;
  }

  const prData = eventData.pull_request;
  const repositoryData = eventData.repository;
  const actionData = eventData.action;

  const value: IGitHubConfig["githubCurrentPr"] = {
    name: repositoryData.full_name as string,
    number: prData.number as number,
    action: actionData as string,
    sourceBranch: prData.head.ref as string,
    targetBranch: prData.base.ref as string,
    initiator: {
      login: prData.user.login as string,
    },
    repository: {
      fullName: repositoryData.full_name as string,
      name: repositoryData.name as string,
      owner: {
        login: repositoryData.owner.login as string,
      },
    },
    urls: {
      htmlUrl: prData.html_url as string,
      commentsUrl: prData.comments_url as string,
    },
  };
  // Test parsing
  const parsed = z
    .object({
      name: z.string(),
      number: z.number(),
      action: z.string(),
      sourceBranch: z.string(),
      targetBranch: z.string(),
      initiator: githubUserschema,
      repository: githubRepository,
      urls: githubPRUrls,
    })
    .strict()
    .safeParse(value);
  return parsed.success ? parsed.data : undefined;
};
