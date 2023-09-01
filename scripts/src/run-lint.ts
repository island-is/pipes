/* eslint-disable no-console */
import { runWithLimitedConcurrency } from "./lib/get-thread-count.js";
import { runESLint } from "./lib/lint.js";
import { type Workspace, getWorkspaceByDirectory } from "./lib/workspace.js";

import type { LintResult } from "./lib/error-messages.js";

const getTasks = (workspace: Workspace) => {
  return [
    async () => {
      try {
        const lintingResult = await runESLint(workspace);

        return lintingResult;
      } catch (_e) {
        console.error(_e);
        return [
          {
            type: "Lint",
            workspace: workspace.name,
            error: {
              message: "Unknown error",
            },
          } as LintResult,
        ];
      }
    },
  ];
};

export const runLintOnWorkspace = async (workspace: Workspace): Promise<(() => Promise<LintResult[]>)[]> => {
  if (workspace.config.skipLint) {
    return [] as any;
  }
  const tasks = await Promise.all(getTasks(workspace));
  return tasks;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const workspace = await getWorkspaceByDirectory();
  if (workspace.config.skipLint) {
    process.exit(0);
  }
  const tasks = getTasks(workspace);
  const lintResults = (await runWithLimitedConcurrency(tasks).values).flat();
  const hasFailed = typeof lintResults.find((e) => e.status === "Error") !== "undefined";
  const code = hasFailed ? 1 : 0;

  process.exit(code);
}
