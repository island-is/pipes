#!/usr/bin/env node

/**
 * This is for testing.
 * It run two tasks:
 * a) Run tests.
 * b) Runs tsc to check test files.
 *
 * This is all run concurrently since tsc takes it's time.
 *
 * This should be run from the project directory by:
 * yarn run-test
 * or
 * {path-to-this-folder}/run-test.js
 */

import { join } from "node:path";

import { getImports } from "./lib/check-import.js";
import { compileTypescript } from "./lib/compile-typescript.js";
import { getScriptDirectory } from "./lib/get-script-directory.js";
import { runWithLimitedConcurrency } from "./lib/get-thread-count.js";
import { Shell } from "./lib/shell.js";
import { getWorkspaceByDirectory } from "./lib/workspace.js";
import { tests } from "./tests/import-tests.js";

import type { ImportResult, TestResult, TypescriptResult } from "./lib/error-messages.js";
import type { Workspace } from "./lib/workspace.js";

const getTasks = (workspace: Workspace) => {
  return [
    async () => {
      // Runs node-test runner
      try {
        const scriptDirectory = getScriptDirectory();
        const testReporter = join(scriptDirectory, "src", "lib", "test-reporter.ts");
        const { stdout, code } = await Shell.execute(
          process.execPath,
          ["--test-reporter", testReporter, "--test", ...workspace.files.source.test],
          {
            cwd: workspace.path,
            env: process.env,
          },
        );
        const data = (JSON.parse(stdout) as Omit<TestResult, "workspace">[]).map((e) => ({
          ...e,
          workspace: workspace.name,
        }));
        if (code !== 0) {
          data.push({
            type: "Test",
            status: "Error",
            workspace: workspace.name,
            message: "Unknown error",
          } as TestResult);
        }
        return data;
      } catch (e) {
        return {
          type: "Test",
          status: "Error",
          workspace: workspace.name,
          message: "Unknown error",
        } as TestResult;
      }
    },
    async () => {
      try {
        const imports = await getImports(workspace);
        const fn = workspace.packageType in tests ? tests[workspace.packageType] : tests["default"];
        if (!fn) {
          throw new Error("This should not happen");
        }
        return fn(workspace, imports);
      } catch (e) {
        return {
          type: "Import",
          status: "Error",
          workspace: workspace.name,
          error: {
            details: e,
            message: "Unknown error",
          },
        } as ImportResult;
      }
    },
    () => {
      try {
        return compileTypescript(workspace, "test");
      } catch (_e) {
        return {
          type: "Typescript",
          mode: "test",
          workspace: workspace.name,
          status: "Error",
          error: {
            message: "Unknown error",
          },
        } as TypescriptResult;
      }
    },
  ];
};
export function runTestOnWorkspace(
  workspace: Workspace,
): (
  | (() => Promise<TestResult | { workspace: string; type: "Test"; status: "Success" | "Error" }[]>)
  | (() => Promise<ImportResult | ImportResult[]>)
  | (() => TypescriptResult | TypescriptResult[])
)[] {
  if (workspace.config.skipTest) {
    return [];
  }
  const tasks = getTasks(workspace);
  return tasks;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const workspace = await getWorkspaceByDirectory();
  if (workspace.config.skipTest) {
    process.exit(0);
  }
  const tasks = getTasks(workspace);
  const exitCodes = (await runWithLimitedConcurrency(tasks, tasks.length).values).flat();
  const hasFailed = typeof exitCodes.find(({ status }) => status === "Error") !== "undefined";
  const code = hasFailed ? 1 : 0;
  process.exit(code);
}
