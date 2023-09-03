import { dirname, join } from "node:path/posix";
import { fileURLToPath } from "node:url";

import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";

import { devImageKey, devWorkDir } from "./dev-image.js";
import { testReport } from "./report.js";

/**
 * This calculates the build order and injects it as a json file to a container
 */
export const devBuildOrderContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);

devBuildOrderContext.config.appName = `Dev Build with Build order Context`;
devBuildOrderContext.config.nodeWorkDir = devWorkDir;
devBuildOrderContext.config.nodeImageKey = devImageKey;

export const devBuildOrderImageKey = `${devImageKey}-with-build-order`;

devBuildOrderContext.addScript(async (context, config) => {
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
      await testReport.buildOrder.set({
        type: "BuildOrder",
        status: "Success",
      });
      return;
    }
    await testReport.buildOrder.set({
      type: "BuildOrder",
      status: "Error",
      error: result.message,
    });
  } catch (e) {
    await testReport.buildOrder.set({
      type: "BuildOrder",
      status: "Error",
      error: e,
    });
  }
});
