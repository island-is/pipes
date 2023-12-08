import { z } from "@island.is/pipes-core";

const getExtraReleaseVars = (releaseBody: string | undefined) => {
  if (!releaseBody) {
    return {
      version: undefined,
      sha: undefined,
      changelog: undefined,
    };
  }
  const version = releaseBody
    .split("\n")
    .find((e) => e.includes("Version:"))
    ?.split("Version:")[1]
    .trim();

  const sha = releaseBody
    .split("\n")
    .find((e) => e.includes("SHA:"))
    ?.split("SHA:")[1]
    .trim();

  const changelog = releaseBody.split("## Changelog")[1];
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
  console.log({ version, sha, changelog });
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
    githubToken: z
      .string()
      .optional()
      .default(undefined, {
        env: "GITHUB_TOKEN",
        arg: {
          long: "githubToken",
        },
      })
      .parse(undefined),
    releaseBody,
    releaseVersion: version || "1.0.0",
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
