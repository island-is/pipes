import { z } from "@island-is/pipes-core";
import ciInfo from "ci-info";

/** Base config */
export const GlobalConfig = (() => {
  const envConfig = {
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
  if (ciInfo.isCI) {
    return {
      ...envConfig,
      sourceDir: z
        .string()
        .default(undefined, {
          arg: {
            long: "sourceDirectory",
          },
          env: ciInfo.GITHUB_ACTIONS ? "GITHUB_WORKSPACE" : "PIPES_PROJECT_ROOT",
        })
        .parse(undefined),
    };
  }
  return {
    ...envConfig,
    sourceDir: z
      .string()
      .default(undefined, {
        arg: {
          long: "sourceDirectory",
        },
        env: "PIPES_PROJECT_ROOT",
      })
      .parse(undefined),
  };
})();
