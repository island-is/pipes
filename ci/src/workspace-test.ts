import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";

import { devImageKey, devWorkDir } from "./dev-image.js";
import { testReport } from "./report.js";

/**
 * This calls yarn constraints on packages to lint dependencies.
 * This does not need any workspace info so is called at the same time as build-order
 */
export const workspaceTestContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
workspaceTestContext.config.appName = `Yarn constraints`;
workspaceTestContext.config.nodeWorkDir = devWorkDir;
workspaceTestContext.config.nodeImageKey = devImageKey;
workspaceTestContext.addScript(async (context, config) => {
  try {
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const testFile = join(currentPath, "workspace-test-runner.ts");
    const reportJSON = join(config.nodeWorkDir, "workspace-test-report.json");
    const reportKey = "WORKSPACE_TEST_REPORT_JSON";
    const container = await context.nodeAddEnv({ env: [[reportKey, reportJSON]] });
    const value = await context.nodeCompileAndRun({
      name: "workspaceTest",
      file: testFile,
      container,
      external: ["@island-is/scripts"],
      output: { fileFromEnv: reportKey },
    });
    if (value.error) {
      await testReport.workspaceTest.set([
        {
          type: "Constraints",
          status: "Error",
          error: {
            message: "Unknown error",
          },
        },
      ]);
      return;
    }
    const jsonMessage = JSON.parse(value.message);
    await testReport.workspaceTest.set(jsonMessage);
  } catch (e) {
    await testReport.workspaceTest.set([
      {
        type: "Constraints",
        status: "Error",
        error: {
          message: "Unknown error",
        },
      },
    ]);
  }
});
