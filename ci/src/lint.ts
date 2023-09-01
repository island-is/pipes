import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { createPipesCore } from "@island.is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island.is/pipes-module-node";

import { devWithDistImageKey } from "./build.js";
import { devWorkDir } from "./dev-image.js";
import { testReport } from "./report.js";

/** TODO: Fix type generation */
export const lintContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
lintContext.config.appName = `Lint runner`;
lintContext.config.nodeWorkDir = devWorkDir;
lintContext.config.nodeImageKey = devWithDistImageKey;
lintContext.addScript(async (context, config) => {
  try {
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const testFile = join(currentPath, "lint-runner.ts");
    const reportJSON = join(config.nodeWorkDir, "lint-report.json");
    const reportJSONKey = "LINT_REPORT_JSON";
    const container = await context.nodeAddEnv({ env: [[reportJSONKey, reportJSON]] });
    const value = await context.nodeCompileAndRun({
      name: "lint",
      file: testFile,
      container,
      external: ["@island.is/scripts"],
      output: { fileFromEnv: reportJSONKey },
    });
    if (value.error) {
      throw new Error("Failed");
    }
    await testReport.lint.set(JSON.parse(value.message));
  } catch {
    await testReport.lint.set([
      {
        type: "Lint",
        status: "Error",
        workspace: "Unknown",
        file: "Unknown",
        error: {
          message: "Unknown error",
        },
      },
    ]);
  }
});
