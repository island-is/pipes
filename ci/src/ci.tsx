import { PipesDOM, createPipe } from "@island-is/pipes-core";
import React from "react";

import { buildCoreContext } from "./build/build.js";
import { GlobalConfig } from "./config.js";
import { workspaceTestContext } from "./constraints/workspace-test.js";
import { devImageInstallContext } from "./install/dev-image.js";

await createPipe(() => {
  console.log({ hello: { wow: { when: "what" } } });
  const tasks = [devImageInstallContext, workspaceTestContext, buildCoreContext];
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
