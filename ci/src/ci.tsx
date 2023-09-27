import { PipesDOM, createPipe } from "@island-is/pipes-core";
import render from "@island-is/pipes-core/src/utils/ink/render.js";
import React from "react";

import { buildCoreContext } from "./build/build.js";
import { GlobalConfig } from "./config.js";
import { workspaceTestContext } from "./constraints/workspace-test.js";
import { devImageInstallContext } from "./install/dev-image.js";

await createPipe(() => {
  const tasks = [devImageInstallContext, workspaceTestContext, buildCoreContext];
  Object.keys(GlobalConfig).forEach((key) =>
    render(
      <PipesDOM.Info>
        {key}:{GlobalConfig[key as keyof typeof GlobalConfig]}
      </PipesDOM.Info>,
      { forceRenderNow: true },
    ),
  );

  return [...tasks];
});
