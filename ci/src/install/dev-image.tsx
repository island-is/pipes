import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode } from "@island-is/pipes-module-node";

import { GlobalConfig } from "../config.js";
import { testReport } from "../report.js";

import type { PipesNodeModule } from "@island-is/pipes-module-node";
import { PipesDOM, render } from "@island-is/pipes-core";

/**
 * This installs source files to a image and calls yarn install
 */
export const devImageInstallContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
devImageInstallContext.config.nodeSourceDir = GlobalConfig.sourceDir;
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
  console.log("OK");
  render(<PipesDOM.Group title="Install">{true && "hehe"}</PipesDOM.Group>);
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
