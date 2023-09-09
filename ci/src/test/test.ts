import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";

import { devWithDistImageKey } from "../build/build.js";
import { devWorkDir } from "../install/dev-image.js";
import { testReport } from "../report.js";

/** TODO: Fix type generation */
export const testContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
testContext.config.appName = `Test runner`;
testContext.config.nodeWorkDir = devWorkDir;
testContext.config.nodeImageKey = devWithDistImageKey;
testContext.addScript(async (context, config) => {
  try {
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const testFile = join(currentPath, "test-runner.ts");
    const reportJSON = join(config.nodeWorkDir, "test-report.json");
    const reportJSONKey = "TEST_REPORT_JSON";
    const container = await context.nodeAddEnv({ env: [[reportJSONKey, reportJSON]] });
    const value = await context.nodeCompileAndRun({
      name: "test",
      file: testFile,
      container,
      external: ["@island-is/scripts"],
      output: { fileFromEnv: reportJSONKey },
    });
    if (value.error) {
      throw new Error("Failed");
    }
    await testReport.test.set(JSON.parse(value.message));
  } catch (e) {
    await testReport.test.set([
      {
        type: "Test",
        status: "Error",
        workspace: "Unknown",
        message: "Unknown error",
      },
    ]);
  }
});
