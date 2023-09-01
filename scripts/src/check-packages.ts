/**
 * @file This script runs `yarn constraints` to ensure that `package.json`'s are correct.
 */

import { dirname } from "node:path";

import { getScriptDirectory } from "./lib/get-script-directory.js";
import { runWithLimitedConcurrency } from "./lib/get-thread-count.js";
import { Shell } from "./lib/shell.js";

import type { ConstraintsResult } from "./lib/error-messages.js";

const root = dirname(getScriptDirectory());
const tasks = [
  async () => {
    try {
      const { code, stdout, stderr } = await Shell.execute("yarn", ["constraints"], {
        env: process.env,
        cwd: root,
      });
      if (code !== 0) {
        return {
          type: "Constraints",
          status: "Error",
          error: {
            message: {
              stdout,
              stderr,
            },
          },
        } as ConstraintsResult;
      }
      return {
        type: "Constraints",
        status: "Success",
        message: {
          stdout,
          stderr,
        },
      } as ConstraintsResult;
    } catch (e) {
      return {
        type: "Constraints",
        status: "Error",
        error: {
          message: "Unknown error",
        },
      } as ConstraintsResult;
    }
  },
];

export const checkPackages = (): (() => Promise<ConstraintsResult>)[] => {
  return tasks;
};

if (import.meta.url.replace(/\.ts$/, ".js") === `file://${process.argv[1]}`) {
  const exitCodes = await runWithLimitedConcurrency(tasks, tasks.length).values;
  const hasFailed = typeof exitCodes.find((e) => e.status === "Error") !== "undefined";
  const code = hasFailed ? 1 : 0;

  process.exit(code);
}
