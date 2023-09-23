import { join } from "path/posix";

import { type removeContextCommand, z } from "@island-is/pipes-core";

import type { PipesNodeModule } from "../interface.js";

export interface RunStateMessage {
  state: "Success";
  stdout: string;
}
export interface RunStateError {
  state: "Error";
  error: any;
}

export const RunStateSchema = z.promise(
  z.custom<RunState>((value) => {
    if (typeof value !== "object" || value === null) {
      throw new Error(`Invalid format`);
    }
    if ("state" in value && value.state === "Success" && "stdout" in value && typeof value.stdout === "string") {
      return {
        state: value.state,
        stdout: value.stdout,
      };
    }
    if ("state" in value && value.state === "Error" && "error" in value) {
      return {
        state: value.state,
        error: value.error,
      };
    }
    throw new Error("Invalid format");
  }),
);

export type RunState = RunStateError | RunStateMessage;

export const run: removeContextCommand<PipesNodeModule["Context"]["Implement"]["nodeRun"]> = async function run(
  context,
  config,
  { args, relativeCwd = "." },
) {
  const container = await context.nodePrepareContainer();
  const path = join(config.nodeWorkDir, relativeCwd);

  try {
    const stdout = await container
      .withWorkdir(path)
      .withExec([config.nodePackageManager, ...args])
      .stdout();
    return {
      state: "Success",
      stdout,
    };
  } catch (error) {
    return {
      state: "Error",
      error,
    };
  }
};
