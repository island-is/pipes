import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { createPipesCore } from "@island.is/pipes-module-core";
import { PipesGitHub, type PipesGitHubModule } from "@island.is/pipes-module-github";
import { PipesNode, type PipesNodeModule } from "@island.is/pipes-module-node";

import { devWithDistImageKey } from "./build.js";
import { config as GlobalConfig } from "./config.js";
import { devWorkDir } from "./dev-image.js";
import { testReport } from "./report.js";
import { readFile } from "fs/promises";

/** TODO: Fix type generation */
export const releaseContext = createPipesCore()
  .addModule<PipesNodeModule>(PipesNode)
  .addModule<PipesGitHubModule>(PipesGitHub);
releaseContext.config.appName = `Release dir`;
releaseContext.config.nodeWorkDir = devWorkDir;
releaseContext.config.nodeImageKey = devWithDistImageKey;
releaseContext.addScript(async (context, config) => {
  if (GlobalConfig.npmAuthToken) {
    console.error(`Npm auth token not set`);
    context.haltAll();
  }
  const errArr = (
    await Promise.all([
      await testReport.buildOrder.get(),
      (await testReport.build.get()).filter((e) => e.status === "Error"),
      (await testReport.workspaceTest.get()).filter((e) => e.status === "Error"),
      (await testReport.lint.get()).filter((e) => e.status === "Error"),
      (await testReport.test.get()).filter((e) => e.status === "Error"),
    ])
  )
    .flat()
    .filter((e) => e.status === "Error");
  if (errArr.length > 0) {
    console.error(`Failed!`);
  }
  const currentPath = fileURLToPath(dirname(import.meta.url));
  const testFile = join(currentPath, "release-runner.ts");
  const reportJSON = join(config.nodeWorkDir, "release-report.json");
  const reportJSONKey = "TEST_REPORT_JSON";

  const container = await context.nodeAddEnv({
    env: [
      [reportJSONKey, reportJSON],
      ["NODE_AUTH_TOKEN", GlobalConfig.npmAuthToken],
      ["NPM_AUTH_TOKEN", GlobalConfig.npmAuthToken],
    ],
  });
  const value = await context.nodeCompileAndRun({
    name: "test",
    file: testFile,
    container,
    external: ["@island.is/scripts"],
    output: { fileFromEnv: reportJSONKey },
  });
  console.log(value);
  if (value.error) {
    context.haltAll();
  }
  const data = JSON.parse(value.message) as { packageFailed: string[]; packageSuccess: string[]; error: string[] };
  console.log(data);
  if (data.packageFailed.length > 0 || data.error.length > 0) {
    console.error("publish failed");
    context.haltAll();
  }
});
