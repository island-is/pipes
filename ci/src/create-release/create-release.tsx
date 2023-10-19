import { PipesDOM, createPipesCore, createTask } from "@island.is/pipes-core";
import { PipesGitHub } from "@island.is/pipes-module-github";
import * as React from "react";

import { GlobalConfig } from "../config.js";

import type { PipesGitHubModule } from "@island.is/pipes-module-github";

const defaultChangeLOG = [`First version`];
const defaultVersion = "0.1.0";
const releaseMARKDOWNTemplate = ({
  version,
  sha,
  shaURL,
  changelog,
}: {
  version: string;
  sha: string;
  shaURL: string;
  changelog: string[];
}): string => {
  return `
  * Version: ${version}
  * SHA: [${sha}](${shaURL})

  ## Changelog

  ${changelog.map((e) => `* ${e}`).join("\n")}
  `;
};

const getTitle = ({ version }: { version: string }) => {
  return `Release draft for version: ${version}`;
};

/**
 * This installs source files to a image and calls yarn install
 */
export const createReleaseContext = createPipesCore().addModule<PipesGitHubModule>(PipesGitHub);
createReleaseContext.config.appName = "Create release issue";
createReleaseContext.addScript(async (context, config) => {
  const sha = GlobalConfig.releaseSHA;
  if (!sha) {
    throw new Error(`Release SHA is not defined`);
  }

  const getShaURL = (sha: string) => {
    return `https://github.com/${config.githubOwner}/${config.githubRepo}/commit/${sha}`;
  };
  const shaURL = getShaURL(sha);
  await createTask(
    async () => {
      const previousVersion = await context.githubGetMatchingCommit({ sha, tagPattern: /^release-.*/ });
      const printmessage = async ({ id, url }: { id: number; url: string }) => {
        await using _render = await PipesDOM.render(
          <PipesDOM.Text>
            Release issue {id} open on url: {url}
          </PipesDOM.Text>,
          {
            forceRenderNow: true,
          },
        );
      };
      if (previousVersion == null) {
        const version = defaultVersion;
        const changelog = defaultChangeLOG;
        const body = releaseMARKDOWNTemplate({
          version,
          changelog,
          sha,
          shaURL,
        });
        const title = getTitle({ version });
        const value = await context.githubWriteIssue({
          body,
          title,
        });
        await printmessage(value);
        return;
      }
      const commits = await context.githubGetCommitsBetween({ startSha: previousVersion.sha, endSha: sha });
      // FOR NOW: By default lets just now patch the last number
      const version = previousVersion.tag
        .replace("release-", "")
        .split(".")
        .map((value, index) => `${parseInt(value, 10) + (index === 2 ? 1 : 0)}`)
        .join("\n");
      const changelog = commits.map((e) => `[${e.commit}](${getShaURL(e.sha)})`);
      const body = releaseMARKDOWNTemplate({
        version,
        changelog,
        sha,
        shaURL,
      });
      const title = getTitle({ version });
      const value = await context.githubWriteIssue({
        body,
        title,
      });
      await printmessage(value);
    },
    {
      inProgress: `Automerging if needed`,
      finished: "Automerging finished",
      error: "Failed automerging",
    },
    context,
  );
});
