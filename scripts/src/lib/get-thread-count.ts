/**
 * @file To run few tasks at once
 */

import { cpus } from "node:os";

import { extractErrorMessage } from "./extract-error-message.js";

const workerCount = Math.floor(cpus().length / 2);

export type RunnerDetails = {
  type: "Runner";
  status: "Success";
  duration: number;
  value: unknown;
};

export type RunnerError = {
  type: "Runner";
  status: "Error";
  duration: number;
  error: {
    message: string;
    details?: unknown;
  };
};

interface Output {
  halt: () => void;
  values: Promise<Array<RunnerError | RunnerDetails>>;
}

/**
 * @param {(() => any)[]} tasks - List of asynchronous tasks to be run
 * @param {number} limit - Maximum number of tasks to run concurrently
 * @returns {Promise<any[]>} returns every value
 */
export const runWithLimitedConcurrency = <T extends (() => any)[]>(tasks: T, limit: number = workerCount): Output => {
  const results: any[] = [];

  let stopped = false;
  const firstPromise = new Promise((resolve) => {
    const taskQueue = [...tasks];
    const executeTask = async (fn: () => any) => {
      if (stopped) {
        return;
      }

      if (typeof fn !== "function") {
        throw new Error(`Invalid value`);
      }
      const value = await (async () => {
        try {
          const returnValue = await fn();
          return returnValue;
        } catch (e: unknown) {
          return {
            type: "Runner",
            error: {
              message: extractErrorMessage(e),
              details: e,
            },
          };
        }
      })();
      results.push(value);
      if (!stopped && taskQueue.length === 0 && results.length === tasks.length) {
        resolve(results);
        return;
      }
      const nextTask = taskQueue.shift();
      if (nextTask) {
        void executeTask(nextTask);
      }
    };

    for (let i = 0; i < limit; i++) {
      const nextTask = taskQueue.shift();
      if (nextTask) {
        void executeTask(nextTask);
      }
    }
  });
  let haltResolve: (value: any[]) => void;
  const haltPromise = new Promise<any[]>((resolve) => {
    haltResolve = resolve;
  });
  const halt = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    haltResolve([
      ...results,
      {
        type: "Runner",
        error: {
          message: "Run was interupted",
        },
      },
    ]);
  };

  return {
    halt,
    values: Promise.race([haltPromise, firstPromise]) as any,
  };
};
