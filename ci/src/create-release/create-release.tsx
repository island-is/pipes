import { PipesDOM, createPipesCore, createTask } from "@island.is/pipes-core";
import { PipesGitHub } from "@island.is/pipes-module-github";
import * as React from "react";

import { GlobalConfig } from "../config.js";

import type { PipesGitHubModule } from "@island.is/pipes-module-github";

const releaseMARKDOWNTemplate = ({
  version,
  sha,
  changelog,
}: {
  version: string;
  sha: string;
  shaURL: string;
  changelog: string[];
}): string => {
  return `
  * Version: ${version}
  * SHA: ${sha}

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

      // FOR NOW: By default lets just now patch the last number
      const version = GlobalConfig.releaseVersion;
      const body = releaseMARKDOWNTemplate({
        version,
        changelog: (GlobalConfig.releaseChangelog ?? "").split("\n"),
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
