import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { PipesDOM, createZodStore, render } from "@island-is/pipes-core";
import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";
import { z } from "zod";

import { devBuildOrderContext, devBuildOrderImageKey } from "../builder-order/build-order.js";
import { devWorkDir } from "../install/dev-image.js";
import { testReport } from "../report.js";

import type { RunnerError, SWCResult, TypescriptResult } from "@island-is/scripts";
import type { RollupResult } from "@island-is/scripts/src/lib/build-with-rollup.js";

export const devWithDistImageKey = `${devBuildOrderImageKey}-dist`;

/**
 * Builds packages for testing and deploying.
 * NOTE: Some linter behaviour fails if type is not ready.
 * So this should run first.
 */
export const buildContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
buildContext.config.appName = `Build`;
buildContext.config.nodeWorkDir = devWorkDir;
buildContext.config.nodeImageKey = devBuildOrderImageKey;
buildContext.addDependency(devBuildOrderContext.symbol);
buildContext.addScript(async (context, config) => {
  const store = createZodStore({
    state: z
      .union([
        z.literal("Building"),
        z.literal("Build"),
        z.object({
          type: z.literal("Error"),
          errorJSX: z.any().optional(),
          value: z.any(),
        }),
      ])
      .default("Building"),
  });
  render(() => (
    <PipesDOM.Group title="Building">
      {((state) => {
        if (typeof state === "object" && state.type === "Error") {
          const duration = context.getDurationInMs();
          return (
            <>
              <PipesDOM.Failure>Failed building (duration: {duration} ms)</PipesDOM.Failure>
              <PipesDOM.Error>{JSON.stringify(state.value)}</PipesDOM.Error>
            </>
          );
        }
        if (state === "Build") {
          const duration = context.getDurationInMs();
          return <PipesDOM.Success>Finished building (duration: {duration} ms)</PipesDOM.Success>;
        }
        return <PipesDOM.Info>Building…</PipesDOM.Info>;
      })(store.state)}
    </PipesDOM.Group>
  ));
  try {
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const testFile = join(currentPath, "build-runner.ts");
    const reportJSON = join(config.nodeWorkDir, "build-report.json");
    const reportJSONKey = "BUILD_REPORT_JSON";
    const container = await context.nodeAddEnv({ env: [[reportJSONKey, reportJSON]] });
    const value = await context.nodeCompileAndRun({
      name: "build",
      file: testFile,
      container,
      external: ["@island-is/scripts"],
      output: { fileFromEnv: reportJSONKey },
    });
    if (value.error || !value.container) {
      throw new Error("Failed");
    }
    const imageStore = await context.imageStore;
    await imageStore.setKey(`node-${devWithDistImageKey}`, value.container);
    await testReport.build.set(JSON.parse(value.message));
    const returnValue = await testReport.build.get();
    const typescriptErrors = returnValue
      .filter((e): e is TypescriptResult => e.status === "Error" && e.type === "Typescript")
      .map((e) => (
        <PipesDOM.Error>
          Type error in workspace {e.workspace} in file {e.status === "Error" ? e.file : "Unknown"}
        </PipesDOM.Error>
      ));
    const swcErrors = returnValue
      .filter((e): e is SWCResult => e.status === "Error" && e.type === "SWC")
      .map((e) => (
        <PipesDOM.Error>
          Import error in workspace {e.workspace} with error: {e.status === "Error" ? e.error.message : "Unknown"}
        </PipesDOM.Error>
      ));
    const rollupErrors = returnValue
      .filter((e): e is RollupResult => e.status === "Error" && e.type === "Rollup")
      .map((e) => <PipesDOM.Error>Test error in workspace {e.workspace}</PipesDOM.Error>);
    const unknownErrors = returnValue
      .filter((e): e is RunnerError => e.status === "Error" && e.type === "Runner")
      .map(() => <PipesDOM.Error>Unknown build error</PipesDOM.Error>);
    const errors = [...typescriptErrors, ...swcErrors, ...rollupErrors, ...unknownErrors];
    if (errors.length > 0) {
      store.state = {
        type: "Error",
        errorJSX: <>{errors}</>,
      };
      context.haltAll();
      return;
    }
    store.state = "Build";
  } catch {
    await testReport.build.set([
      {
        type: "Rollup",
        status: "Error",
        workspace: "Unknown",
        error: {
          message: "Unknown error",
        },
      },
    ]);
  }
});
