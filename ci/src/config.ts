import { z } from "@island-is/pipes-core";

/** Base config */
export const GlobalConfig = (() => {
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
    version: z
      .string()
      .optional()
      .default(undefined, {
        env: "RELEASE_VERSION",
        arg: {
          long: "release-version",
        },
      })
      .parse(undefined),
    releaseSHA: z
      .string()
      .optional()
      .default(undefined, {
        env: "RELEASE_SHA",
        arg: {
          long: "release-sha",
        },
      }),
    npmAuthToken: z.string().optional().default(undefined, { env: "NPM_TOKEN" }).parse(undefined),
    action: z
      .union([z.literal("Test"), z.literal("Release")])
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
