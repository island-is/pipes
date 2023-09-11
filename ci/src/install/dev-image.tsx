import { PipesDOM, render, z } from "@island-is/pipes-core";
import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode } from "@island-is/pipes-module-node";
import { createZodStore } from "@island-is/zod";

import { GlobalConfig } from "../config.js";
import { testReport } from "../report.js";

import type { PipesNodeModule } from "@island-is/pipes-module-node";

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
  const store = createZodStore({
    state: z
      .union([
        z.literal("Installing"),
        z.literal("Installed"),
        z.object({
          type: z.literal("Error"),
          value: z.any(),
        }),
      ])
      .default("Installing"),
  });
  render(() => (
    <PipesDOM.Group title="Installing packages">
      {((state) => {
        if (typeof state === "object" && state.type === "Error") {
          const duration = context.getDurationInMs();
          return (
            <>
              <PipesDOM.Failure>Failed installing (duration: {duration} ms)</PipesDOM.Failure>
              <PipesDOM.Error>{JSON.stringify(state.value)}</PipesDOM.Error>
            </>
          );
        }
        if (state === "Installed") {
          const duration = context.getDurationInMs();
          return <PipesDOM.Success>Finished installing (duration: {duration} ms)</PipesDOM.Success>;
        }
        return <PipesDOM.Info>Installing packages…</PipesDOM.Info>;
      })(store.state)}
    </PipesDOM.Group>
  ));
  try {
    await context.nodePrepareContainer();
    await testReport.buildDevImage.set({
      type: "BuildDevImage",
      status: "Success",
    });
    store.state = "Installed";
  } catch (e) {
    store.state = {
      type: "Error",
      value: e,
    };
    await testReport.buildDevImage.set({
      type: "BuildDevImage",
      status: "Error",
      error: e,
    });
  }
});
