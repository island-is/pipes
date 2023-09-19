import { dirname, join } from "node:path/posix";
import { fileURLToPath } from "node:url";

import { PipesDOM, createZodStore, render, z } from "@island-is/pipes-core";
import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";
import React from "react";

import { devImageInstallContext, devImageKey, devWorkDir } from "../install/dev-image.js";
import { testReport } from "../report.js";

/**
 * This calculates the build order and injects it as a json file to a container
 */
export const devBuildOrderContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);

devBuildOrderContext.config.appName = `Build Order`;
devBuildOrderContext.config.nodeWorkDir = devWorkDir;
devBuildOrderContext.config.nodeImageKey = devImageKey;
devBuildOrderContext.addDependency(devImageInstallContext.symbol);
export const devBuildOrderImageKey = `${devImageKey}-with-build-order`;

devBuildOrderContext.addScript(async (context, config) => {
  const store = createZodStore({
    state: z
      .union([
        z.literal("Creating build order"),
        z.literal("Build order created"),
        z.object({
          type: z.literal("Error"),
          value: z.any(),
        }),
      ])
      .default("Creating build order"),
  });
  void render(() => (
    <PipesDOM.Group title="Creating build order">
      {((state) => {
        if (typeof state === "object" && state.type === "Error") {
          const duration = context.getDurationInMs();
          return (
            <>
              <PipesDOM.Failure>Failed creating build order (duration: {duration} ms)</PipesDOM.Failure>
              <PipesDOM.Error>{JSON.stringify(state.value)}</PipesDOM.Error>
            </>
          );
        }
        if (state === "Build order created") {
          const duration = context.getDurationInMs();
          return <PipesDOM.Success>Finished creating build order (duration: {duration} ms)</PipesDOM.Success>;
        }
        return <PipesDOM.Info>Creating build order…</PipesDOM.Info>;
      })(store.state)}
    </PipesDOM.Group>
  ));

  try {
    const imageStore = await context.imageStore;

    const container = await imageStore.awaitForAvailability(`node-${config.nodeImageKey}`);
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const scriptFile = join(currentPath, "build-order-runner.ts");
    const buildOrderJSON = join(config.nodeWorkDir, "build-order.json");
    const buildOrderContainer = context.addEnv({
      container,
      env: [["BUILD_ORDER_JSON", buildOrderJSON]],
    });
    const result = await context.nodeCompileAndRun({
      name: "build-order",
      file: scriptFile,
      container: buildOrderContainer,
      external: ["@island-is/scripts"],
      output: { output: "stdout" },
    });

    if (!result.error && result.container) {
      await imageStore.setKey(`node-${devBuildOrderImageKey}`, result.container);
      store.state = "Build order created";
      await testReport.buildOrder.set({
        type: "BuildOrder",
        status: "Success",
      });
      return;
    }
    store.state = {
      type: "Error",
      value: result.message,
    };
    await testReport.buildOrder.set({
      type: "BuildOrder",
      status: "Error",
      error: result.message,
    });
  } catch (e) {
    store.state = {
      type: "Error",
      value: e,
    };
    await testReport.buildOrder.set({
      type: "BuildOrder",
      status: "Error",
      error: e,
    });
  }
});
