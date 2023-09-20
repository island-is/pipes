import { createPipe } from "@island-is/pipes-core";

import { buildContext } from "./build/build.js";
import { devBuildOrderContext } from "./builder-order/build-order.js";
import { GlobalConfig } from "./config.js";
import { workspaceTestContext } from "./constraints/workspace-test.js";
import { devImageInstallContext } from "./install/dev-image.js";
import { lintContext } from "./lint/lint.js";
import { githubTestContext } from "./pr-report/github-test.js";
import { releaseContext } from "./release/release.js";
import { testContext } from "./test/test.js";

await createPipe(() => {
  const tasks = [devImageInstallContext, devBuildOrderContext, workspaceTestContext, buildContext, testContext];
  if (GlobalConfig.action === "Release") {
    return [...tasks, releaseContext];
  }
  if (GlobalConfig.action === "Test") {
    return [
      githubTestContext,
      devImageInstallContext,
      devBuildOrderContext,
      workspaceTestContext,
      buildContext,
      testContext,
    ];
  }
  throw new Error("Not defined");
});
