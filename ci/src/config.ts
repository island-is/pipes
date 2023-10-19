import { z } from "@island.is/pipes-core";

const getExtraReleaseVars = (releaseBody: string | undefined) => {
  if (!releaseBody) {
    return {
      version: undefined,
      sha: undefined,
      changelog: undefined,
    };
  }
  const versionMatch = releaseBody.match(/Version: (\S+)/);
  const version = versionMatch ? versionMatch[1] : null;

  const shaMatch = releaseBody.match(/SHA: \[([a-f0-9]+)\]/);
  const sha = shaMatch ? shaMatch[1] : null;

  const changelogMatch = releaseBody.match(/## Changelog\n\n([\s\S]+)$/); // Assuming changelog is at the end
  const changelog = changelogMatch ? changelogMatch[1].trim() : null;
  return {
    version,
    sha,
    changelog,
  };
};

/** Base config */
export const GlobalConfig = (() => {
  const releaseBody = z
    .string()
    .optional()
    .default(undefined, {
      env: "RELEASE_BODY",
      arg: {
        long: "release-body",
      },
    })
    .parse(undefined);

  const { version, sha, changelog } = getExtraReleaseVars(releaseBody);
  return {
    workDir: "/pipes-ci",
    sourceDir: z
      .string()
      .default(undefined, {
        env: "PIPES_PROJECT_ROOT",
        arg: {
          long: "sourcedir",
        },
      })
      .parse(undefined),

    releaseBody,
    releaseVersion: version,
    releaseSha: sha,
    releaseChangelog: changelog,
    npmAuthToken: z.string().optional().default(undefined, { env: "NPM_TOKEN" }).parse(undefined),
    releaseSHA: z.string().optional().default(undefined, { env: "RELEASE_SHA" }).parse(),
    action: z
      .union([z.literal("Test"), z.literal("Release"), z.literal("CreateRelease")])
      .default("Test", {
        env: "PIPES_ACTION",
        arg: {
          long: "action",
        },
      })
      .describe("Which action to run from the CI")
      .parse(undefined),
  };
})();
