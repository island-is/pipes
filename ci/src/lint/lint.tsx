import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { PipesDOM, createZodStore, z } from "@island-is/pipes-core";
import { createPipesCore, render } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";
import React from "react";

import { buildContext, devWithDistImageKey } from "../build/build.js";
import { devWorkDir } from "../install/dev-image.js";
import { testReport } from "../report.js";

/** TODO: Fix type generation */
export const lintContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
lintContext.config.appName = `Lint runner`;
lintContext.config.nodeWorkDir = devWorkDir;
lintContext.config.nodeImageKey = devWithDistImageKey;
lintContext.addDependency(buildContext.symbol);
lintContext.addScript(async (context, config) => {
  const store = createZodStore({
    duration: z.number().default(0),
    state: z
      .union([
        z.literal("Linting"),
        z.literal("Linted"),
        z.object({
          type: z.literal("Error"),
          errorJSX: z.any().optional(),
          value: z.any(),
        }),
      ])
      .default("Linting"),
  });
  void render(() => (
    <PipesDOM.Group title="Linter">
      {((state, duration) => {
        if (typeof state === "object" && state.type === "Error") {
          return (
            <>
              <PipesDOM.Failure>
                Failed linting <PipesDOM.Timestamp time={duration} format={"mm:ss.SSS"} />
              </PipesDOM.Failure>
              <PipesDOM.Error>{state.errorJSX ? state.errorJSX : JSON.stringify(state.value)}</PipesDOM.Error>
            </>
          );
        }
        if (state === "Linted") {
          return (
            <PipesDOM.Success>
              Finished linting <PipesDOM.Timestamp time={duration} format={"mm:ss.SSS"} />
            </PipesDOM.Success>
          );
        }
        return <PipesDOM.Info>Linting…</PipesDOM.Info>;
      })(store.state, store.duration)}
    </PipesDOM.Group>
  ));
  try {
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const testFile = join(currentPath, "lint-runner.ts");
    const reportJSON = join(config.nodeWorkDir, "lint-report.json");
    const reportJSONKey = "LINT_REPORT_JSON";
    const container = await context.nodeAddEnv({ env: [[reportJSONKey, reportJSON]] });
    const value = await context.nodeCompileAndRun({
      name: "lint",
      file: testFile,
      container,
      external: ["@island-is/scripts"],
      output: { fileFromEnv: reportJSONKey },
    });
    if (value.error) {
      throw new Error("Failed");
    }
    store.state = "Linted";
    await testReport.lint.set(JSON.parse(value.message));
    const values = await testReport.lint.get();
    const errors = values
      .filter((e) => e.status === "Error")
      .map((e, index) => {
        if (e.type === "Lint") {
          return (
            <PipesDOM.Error key={index}>
              Lint error in workspace {e.workspace}, file: {e.file}
            </PipesDOM.Error>
          );
        }
        return <PipesDOM.Error key={index}>Unknown lint error</PipesDOM.Error>;
      });
    if (errors.length > 0) {
      store.state = {
        type: "Error",
        errorJSX: <>{errors}</>,
      };
      context.haltAll();
      return;
    }
    store.duration = context.getDurationInMs();
    store.state = "Linted";
  } catch (e) {
    store.duration = context.getDurationInMs();
    store.state = {
      type: "Error",
      value: e,
    };
    await testReport.lint.set([
      {
        type: "Lint",
        status: "Error",
        workspace: "Unknown",
        file: "Unknown",
        error: {
          message: "Unknown error",
        },
      },
    ]);
  }
});
