import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode } from "@island-is/pipes-module-node";

import { config } from "./config.js";
import { testReport } from "./report.js";

import type { PipesNodeModule } from "@island-is/pipes-module-node";

/**
 * This installs source files to a image and calls yarn install
 */
export const devImageInstallContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
devImageInstallContext.config.nodeSourceDir = config.sourceDir;
devImageInstallContext.config.appName = `Development install`;
devImageInstallContext.config.nodeImageKey = `dev-image`;
devImageInstallContext.config.nodeSourceIncludeOrExclude = "exclude";

// Skip node_modules and dist.
devImageInstallContext.config.nodeSourceExclude = [
  "**/node_modules",
  "**/dist",
  "**/.env*",
  "**/.git",
  "**/.github",
  "**/.devcontainer",
  "**/.husky",
];
export const devImageKey = `${devImageInstallContext.config.nodeImageKey}`;
export const devWorkDir = devImageInstallContext.config.nodeWorkDir;

devImageInstallContext.addScript(async (context) => {
  try {
    await context.nodePrepareContainer();
    await testReport.buildDevImage.set({
      type: "BuildDevImage",
      status: "Success",
    });
  } catch (e) {
    await testReport.buildDevImage.set({
      type: "BuildDevImage",
      status: "Error",
      error: e,
    });
  }
});
