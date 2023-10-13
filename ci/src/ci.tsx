import { PipesDOM, createPipe } from "@island.is/pipes-core";
import ciinfo from "ci-info";
import React from "react";

import { automergeContext } from "./automerge/automerge.js";
import { buildCoreContext } from "./build/build.js";
import { GlobalConfig } from "./config.js";
import { workspaceTestContext } from "./constraints/workspace-test.js";
import { devImageInstallContext } from "./install/dev-image.js";

await createPipe(() => {
  const tasks = [devImageInstallContext, workspaceTestContext, buildCoreContext];
  if (ciinfo.isPR) {
    for (const task of tasks) {
      automergeContext.addDependency(task.symbol);
    }
    tasks.push(automergeContext as any);
  }
  if (GlobalConfig.npmAuthToken) {
    PipesDOM.setMask(GlobalConfig.npmAuthToken);
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
