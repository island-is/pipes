import { execSync } from "child_process";

import { z } from "@island-is/pipes-core";

let VERSION: string | undefined = undefined;
try {
  const CURRENT_BRANCH = execSync("git rev-parse --abbrev-ref HEAD").toString();
  VERSION = CURRENT_BRANCH.startsWith("release-") ? CURRENT_BRANCH.split("release-")[1] : undefined;
} catch {
  // Empty on purpose
}

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
      .default(VERSION, {
        env: "RELEASE_VERSION",
        arg: {
          long: "release-version",
        },
      })
      .parse(undefined),
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
