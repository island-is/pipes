import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";

import { devBuildOrderImageKey } from "../builder-order/build-order.js";
import { devWorkDir } from "../install/dev-image.js";
import { testReport } from "../report.js";

export const devWithDistImageKey = `${devBuildOrderImageKey}-dist`;

/**
 * Builds packages for testing and deploying.
 * NOTE: Some linter behaviour fails if type is not ready.
 * So this should run first.
 */
export const buildContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
buildContext.config.appName = `Build runner`;
buildContext.config.nodeWorkDir = devWorkDir;
buildContext.config.nodeImageKey = devBuildOrderImageKey;
buildContext.addScript(async (context, config) => {
  try {
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const testFile = join(currentPath, "build-runner.ts");
    const reportJSON = join(config.nodeWorkDir, "build-report.json");
    const reportJSONKey = "BUILD_REPORT_JSON";
    const container = await context.nodeAddEnv({ env: [[reportJSONKey, reportJSON]] });
    const value = await context.nodeCompileAndRun({
      name: "build",
      file: testFile,
      container,
      external: ["@island-is/scripts"],
      output: { fileFromEnv: reportJSONKey },
    });
    if (value.error || !value.container) {
      throw new Error("Failed");
    }
    const imageStore = await context.imageStore;
    await imageStore.setKey(`node-${devWithDistImageKey}`, value.container);
    await testReport.build.set(JSON.parse(value.message));
  } catch {
    await testReport.build.set([
      {
        type: "Rollup",
        status: "Error",
        workspace: "Unknown",
        error: {
          message: "Unknown error",
        },
      },
    ]);
  }
});
