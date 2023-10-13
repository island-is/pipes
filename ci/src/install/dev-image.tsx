import { createPipesCore, createTask } from "@island.is/pipes-core";
import { PipesNode } from "@island.is/pipes-module-node";

import { GlobalConfig } from "../config.js";

import type { PipesNodeModule } from "@island.is/pipes-module-node";

/**
 * This installs source files to a image and calls yarn install
 */
export const devImageInstallContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
devImageInstallContext.config.nodeSourceDir = GlobalConfig.sourceDir;
devImageInstallContext.config.nodeWorkDir = GlobalConfig.workDir;
devImageInstallContext.config.appName = `Development install`;
devImageInstallContext.config.nodeImageKey = `dev-image`;
devImageInstallContext.config.nodeSourceIncludeOrExclude = "exclude";

devImageInstallContext.config.nodeSourceExclude = [
  "**/node_modules",
  "**/dist",
  "**/.env*",
  "**/.git",
  "**/.github",
  "**/.devcontainer",
  "**/.husky",
];
export const devImageKey = devImageInstallContext.config.nodeImageKey;
export const devWorkDir = devImageInstallContext.config.nodeWorkDir;

devImageInstallContext.addScript(async (context) => {
  await createTask(
    async () => {
      await context.nodePrepareContainer();
    },
    {
      inProgress: `Preparing container`,
      finished: "Container prepared",
      error: "Failed preparing container",
    },
    context,
  );
});
