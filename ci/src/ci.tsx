import { PipesDOM, createPipe } from "@island.is/pipes-core";
import ciinfo from "ci-info";
import React from "react";

import { automergeContext } from "./automerge/automerge.js";
import { buildCoreContext } from "./build/build.js";
import { GlobalConfig } from "./config.js";
import { workspaceTestContext } from "./constraints/workspace-test.js";
import { createReleaseContext } from "./create-release/create-release.js";
import { devImageInstallContext } from "./install/dev-image.js";

await createPipe(() => {
  if (GlobalConfig.npmAuthToken) {
    PipesDOM.setMask(GlobalConfig.npmAuthToken);
  }
  const tasks = [devImageInstallContext, workspaceTestContext, buildCoreContext];
  if (GlobalConfig.action === "CreateRelease") {
    return [createReleaseContext];
  }
  if (ciinfo.isCI && ciinfo.isPR) {
    for (const task of tasks) {
      automergeContext.addDependency(task.symbol);
    }
    tasks.push(automergeContext as any);
  }

  Object.keys(GlobalConfig).forEach((key) =>
    PipesDOM.render(
      <>
        <PipesDOM.Info>
          {key}:{GlobalConfig[key as keyof typeof GlobalConfig]}
        </PipesDOM.Info>
      </>,
      { forceRenderNow: true },
    ),
  );

  return [...tasks];
});
