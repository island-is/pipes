import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { PipesDOM, createZodStore, render } from "@island-is/pipes-core";
import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";
import * as React from "react";
import { z } from "zod";

import { devImageInstallContext, devImageKey, devWorkDir } from "../install/dev-image.js";
import { testReport } from "../report.js";

/**
 * This calls yarn constraints on packages to lint dependencies.
 * This does not need any workspace info so is called at the same time as build-order
 */
export const workspaceTestContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
workspaceTestContext.config.appName = `Workspaces`;
workspaceTestContext.config.nodeWorkDir = devWorkDir;
workspaceTestContext.config.nodeImageKey = devImageKey;
workspaceTestContext.addDependency(devImageInstallContext.symbol);
workspaceTestContext.addScript(async (context, config) => {
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
  void render(() => (
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
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const testFile = join(currentPath, "workspace-test-runner.ts");
    const reportJSON = join(config.nodeWorkDir, "workspace-test-report.json");
    const reportKey = "WORKSPACE_TEST_REPORT_JSON";
    const container = await context.nodeAddEnv({ env: [[reportKey, reportJSON]] });
    const value = await context.nodeCompileAndRun({
      name: "workspaceTest",
      file: testFile,
      container,
      external: ["@island-is/scripts"],
      output: { fileFromEnv: reportKey },
    });
    if (value.error) {
      store.state = {
        type: "Error",
        value: "Unknown error",
      };
      await testReport.workspaceTest.set([
        {
          type: "Constraints",
          status: "Error",
          error: {
            message: "Unknown error",
          },
        },
      ]);
      return;
    }
    const jsonMessage = JSON.parse(value.message);
    await testReport.workspaceTest.set(jsonMessage);
    store.state = "Workspaces tested";
    store.duration = context.getDurationInMs();
  } catch (e) {
    store.duration = context.getDurationInMs();
    store.state = {
      type: "Error",
      value: e,
    };
    await testReport.workspaceTest.set([
      {
        type: "Constraints",
        status: "Error",
        error: {
          message: "Unknown error",
        },
      },
    ]);
  }
});
