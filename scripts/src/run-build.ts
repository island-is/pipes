#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * @file Build current project.
 */

import { type RollupResult, buildWithRollup } from "./lib/build-with-rollup.js";
import { compileWithSWC } from "./lib/compile-swc.js";
import { compileTypescript } from "./lib/compile-typescript.js";
import { emptyDirectory } from "./lib/file-helper.js";
import { runWithLimitedConcurrency } from "./lib/get-thread-count.js";
import { getWorkspaceByDirectory } from "./lib/workspace.js";

import type { SWCResult, TypescriptResult } from "./lib/error-messages.js";
import type { Workspace } from "./lib/workspace.js";

const getTasks = (workspace: Workspace) => {
  if (workspace.config.buildWithRollup) {
    return [
      (): Promise<RollupResult> => {
        return buildWithRollup(workspace);
      },
    ];
  }
  return [
    async () => {
      try {
        return await compileWithSWC(workspace);
      } catch (e) {
        console.error(e);
        return [
          {
            type: "SWC",
            status: "Error",
            workspace: workspace.name,
            error: {
              message: "Unknown error",
            },
            file: workspace.path,
          } as SWCResult,
        ];
      }
    },
    () => {
      try {
        return compileTypescript(workspace, "build");
      } catch (e) {
        return [
          {
            type: "Typescript",
            workspace: workspace.name,
            file: workspace.path,
            error: {
              message: "UNKNOWN_ERROR",
            },
          } as TypescriptResult,
        ];
      }
    },
  ];
};

export const buildWorkspace = (
  workspace: Workspace,
): (() => Promise<SWCResult[]> | TypescriptResult[] | Promise<RollupResult>)[] => {
  if (workspace.config.skipBuild) {
    return [];
  }
  const tasks = getTasks(workspace);
  return tasks;
};

export const runBuildOnWorkspace = buildWorkspace;

if (import.meta.url === `file://${process.argv[1]}`) {
  const workspace = await getWorkspaceByDirectory();
  if (workspace.config.skipBuild) {
    process.exit(0);
  }

  await emptyDirectory(workspace.distDirectory);
  const tasks = getTasks(workspace);
  const results = (await runWithLimitedConcurrency(tasks, tasks.length).values).flat();
  const hasFailed = typeof results.find((e) => e.status === "Error") !== "undefined";
  const code = hasFailed ? 1 : 0;

  process.exit(code);
}
