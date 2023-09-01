import { createPipe } from "@island.is/pipes-core";

import { buildContext } from "./build.js";
import { config } from "./config.js";
import { devBuildOrderContext } from "./dev-image-with-build-order.js";
import { devImageInstallContext } from "./dev-image.js";
import { githubMerge } from "./github-merge.js";
import { githubTestContext } from "./github-test.js";
import { lintContext } from "./lint.js";
import { testContext } from "./test.js";
import { workspaceTestContext } from "./workspace-test.js";

await createPipe(() => {
  if (config.action === "Merge") {
    return [githubMerge];
  }
  if (config.action === "Test") {
    return [
      githubTestContext,
      devImageInstallContext,
      devBuildOrderContext,
      workspaceTestContext,
      buildContext,
      lintContext,
      testContext,
    ];
  }
  throw new Error("Not defined");
});
