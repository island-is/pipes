import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { PipesDOM, createZodStore, render } from "@island-is/pipes-core";
import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";
import React from "react";
import { z } from "zod";

import { buildContext, devWithDistImageKey } from "../build/build.js";
import { devWorkDir } from "../install/dev-image.js";
import { testReport } from "../report.js";

import type { ImportResult, TestResult, TypescriptResult } from "@island-is/scripts";

/** TODO: Fix type generation */
export const testContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
testContext.config.appName = `Test runner`;
testContext.config.nodeWorkDir = devWorkDir;
testContext.config.nodeImageKey = devWithDistImageKey;
testContext.addDependency(buildContext.symbol);
testContext.addScript(async (context, config) => {
  const store = createZodStore({
    duration: z.number().default(0),
    state: z
      .union([
        z.literal("Testing"),
        z.literal("Tested"),
        z.object({
          type: z.literal("Error"),
          value: z.any(),
          errorJSX: z.any().optional(),
        }),
      ])
      .default("Testing"),
  });
  void render(() => (
    <PipesDOM.Group title="Test">
      {((state, duration) => {
        if (typeof state === "object" && state.type === "Error") {
          return (
            <>
              <PipesDOM.Failure>
                Failed testing <PipesDOM.Timestamp time={duration} format={"mm:ss.SSS"} />
              </PipesDOM.Failure>
              <PipesDOM.Error>{state.errorJSX ? state.errorJSX : JSON.stringify(state.value)} </PipesDOM.Error>
            </>
          );
        }
        if (state === "Tested") {
          return (
            <PipesDOM.Success>
              Finished testing <PipesDOM.Timestamp time={duration} format={"mm:ss.SSS"} />
            </PipesDOM.Success>
          );
        }
        return <PipesDOM.Info>Testing…</PipesDOM.Info>;
      })(store.state, store.duration)}
    </PipesDOM.Group>
  ));
  try {
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const testFile = join(currentPath, "test-runner.ts");
    const reportJSON = join(config.nodeWorkDir, "test-report.json");
    const reportJSONKey = "TEST_REPORT_JSON";
    const container = await context.nodeAddEnv({ env: [[reportJSONKey, reportJSON]] });
    const value = await context.nodeCompileAndRun({
      name: "test",
      file: testFile,
      container,
      external: ["@island-is/scripts"],
      output: { fileFromEnv: reportJSONKey },
    });
    if (value.error) {
      throw new Error("Failed");
    }
    await testReport.test.set(JSON.parse(value.message));
    const returnValue = await testReport.test.get();
    // If this has any errors
    const typescriptErrors = returnValue
      .filter((e): e is TypescriptResult => e.status === "Error" && e.type === "Typescript")
      .map((e, index) => (
        <PipesDOM.Error key={index}>
          Type error in workspace {e.workspace} in file {e.status === "Error" ? e.file : "Unknown"}
        </PipesDOM.Error>
      ));
    const importErrors = returnValue
      .filter((e): e is ImportResult => e.status === "Error" && e.type === "Import")
      .map((e, index) => (
        <PipesDOM.Error key={index}>
          Import error in workspace {e.workspace} with error: {e.status === "Error" ? e.error.message : "Unknown"}
        </PipesDOM.Error>
      ));
    const testErrors = returnValue
      .filter((e): e is TestResult => e.status === "Error" && e.type === "Test")
      .map((e, index) => <PipesDOM.Error key={index}>Test error in workspace {e.workspace}</PipesDOM.Error>);
    const errors = [...importErrors, ...testErrors, ...typescriptErrors];
    if (errors.length === 0) {
      store.state = {
        type: "Error",
        errorJSX: <>{errors}</>,
      };
      context.haltAll();
      return;
    }
    store.state = "Tested";
    store.duration = context.getDurationInMs();
  } catch (e) {
    store.duration = context.getDurationInMs();
    store.state = {
      type: "Error",
      value: e,
      errorJSX: <></>,
    };
    await testReport.test.set([
      {
        type: "Test",
        status: "Error",
        workspace: "Unknown",
        message: "Unknown error",
      },
    ]);
  }
});
