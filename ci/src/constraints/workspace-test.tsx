import { PipesDOM, createPipesCore, createZodStore } from "@island-is/pipes-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";
import * as React from "react";
import { z } from "zod";

import { devImageInstallContext, devImageKey, devWorkDir } from "../install/dev-image.js";

/**
 * This calls yarn constraints on packages to lint dependencies.
 * This does not need any workspace info so is called at the same time as build-order
 */
export const workspaceTestContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
workspaceTestContext.config.appName = `Workspaces`;
workspaceTestContext.config.nodeWorkDir = devWorkDir;
workspaceTestContext.config.nodeImageKey = devImageKey;
workspaceTestContext.addDependency(devImageInstallContext.symbol);
workspaceTestContext.addScript(async (context, _config) => {
  const store = createZodStore({
    duration: z.number().default(0),
    state: z
      .union([
        z.literal("Testing workspaces"),
        z.literal("Workspaces tested"),
        z.object({
          type: z.literal("Error"),
          value: z.any(),
        }),
      ])
      .default("Testing workspaces"),
  });

  const testFailed = (reason: any) => {
    store.duration = context.getDurationInMs();
    store.state = {
      type: "Error",
      value: reason,
    };
    throw reason;
  };
  const testPassed = () => {
    store.duration = context.getDurationInMs();
    store.state = "Workspaces tested";
  };
  void PipesDOM.render(() => (
    <PipesDOM.Group title="Workspaces">
      {((state, duration) => {
        if (typeof state === "object" && state.type === "Error") {
          return (
            <>
              <PipesDOM.Failure>
                Failed testing workspaces <PipesDOM.Timestamp time={duration} format={"mm:ss.SSS"} />
              </PipesDOM.Failure>
              <PipesDOM.Error>{JSON.stringify(state.value)}</PipesDOM.Error>
            </>
          );
        }
        if (state === "Workspaces tested") {
          return (
            <PipesDOM.Success>
              Finished testing workspaces <PipesDOM.Timestamp time={duration} format={"mm:ss.SSS"} />
            </PipesDOM.Success>
          );
        }
        return <PipesDOM.Info>Testing workspaces…</PipesDOM.Info>;
      })(store.state, store.duration)}
    </PipesDOM.Group>
  ));
  try {
    const value = await context.nodeRun({ args: ["constraints"] });
    if (value.state === "Error") {
      testFailed(value.error);
      return;
    }
    testPassed();
  } catch (e) {
    testFailed(e);
  }
});
