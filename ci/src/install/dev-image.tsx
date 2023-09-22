import { PipesDOM, createPipesCore, createZodStore, z } from "@island-is/pipes-core";
import { PipesNode } from "@island-is/pipes-module-node";
import React from "react";

import { GlobalConfig } from "../config.js";

import type { PipesNodeModule } from "@island-is/pipes-module-node";

/**
 * This installs source files to a image and calls yarn install
 */
export const devImageInstallContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
devImageInstallContext.config.nodeSourceDir = GlobalConfig.sourceDir;
devImageInstallContext.config.appName = `Development install`;
devImageInstallContext.config.nodeImageKey = `dev-image`;
devImageInstallContext.config.nodeSourceIncludeOrExclude = "exclude";

// Skstringip node_modules and dist.
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
    duration: z.number().default(0),
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
  const installPassed = () => {
    store.duration = context.getDurationInMs();
    store.state = "Installed";
  };
  const installFailed = (error: any) => {
    store.duration = context.getDurationInMs();
    store.state = {
      type: "Error",
      value: error,
    };
    throw error;
  };

  void PipesDOM.render(() => (
    <PipesDOM.Group title="Installing packages">
      {((state, duration) => {
        if (typeof state === "object" && state.type === "Error") {
          return (
            <>
              <PipesDOM.Failure>
                Failed installing <PipesDOM.Timestamp time={duration} format={"mm:ss.SSS"} />
              </PipesDOM.Failure>
              <PipesDOM.Error>{JSON.stringify(state.value)}</PipesDOM.Error>
            </>
          );
        }
        if (state === "Installed") {
          return (
            <PipesDOM.Success>
              <PipesDOM.Text>Finished installing duration:</PipesDOM.Text>
              <PipesDOM.Timestamp time={duration} format={"mm:ss.SSS"} />
            </PipesDOM.Success>
          );
        }
        return <PipesDOM.Info>Installing packages…</PipesDOM.Info>;
      })(store.state, store.duration)}
    </PipesDOM.Group>
  ));
  try {
    await context.nodePrepareContainer();
    installPassed();
  } catch (error) {
    installFailed(error);
  }
});
