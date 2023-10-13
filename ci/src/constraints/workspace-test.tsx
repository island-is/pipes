import { createPipesCore, createTask } from "@island.is/pipes-core";
import { PipesNode, type PipesNodeModule } from "@island.is/pipes-module-node";

import { devImageInstallContext, devImageKey, devWorkDir } from "../install/dev-image.js";

/**
 * This calls yarn constraints on packages to lint dependencies.
 * This does not need any workspace info so is called at the same time as build-order
 */
export const workspaceTestContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
workspaceTestContext.config.appName = `Workspaces`;
workspaceTestContext.config.nodeWorkDir = devWorkDir;
workspaceTestContext.config.nodeImageKey = devImageKey;
workspaceTestContext.addDependency(devImageInstallContext.symbol);
workspaceTestContext.addScript(async (context, _config) => {
  await createTask(
    async () => {
      const value = await context.nodeRun({ args: ["constraints"] });
      if (value.state === "Error") {
        throw value.error;
      }
    },
    {
      inProgress: `Testing workspace`,
      finished: "Workspace tested",
      error: "Workspace test failed",
    },
    context,
  );
});
