import { join } from "path/posix";

import { Container, PipesDOM, type removeContextCommand, z } from "@island.is/pipes-core";
import React from "react";

import type { PipesNodeModule } from "../interface.js";

export interface RunStateMessage {
  state: "Success";
  container: Container;
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
    if (
      "state" in value &&
      value.state === "Success" &&
      "container" in value &&
      value.container &&
      value.container instanceof Container
    ) {
      return {
        state: value.state,
        container: value.container,
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
  { args, env, relativeCwd = ".", packageManager },
) {
  const container = await context.nodePrepareContainer();
  const path = join(config.nodeWorkDir, relativeCwd);
  console.log(`working on ${path}`);
  if (config.nodeDebug) {
    void PipesDOM.render(
      <PipesDOM.Info>
        Running {config.nodePackageManager} with args: {args.join(" ")} in path: {path}
      </PipesDOM.Info>,
      {
        forceRenderNow: true,
      },
    );
  }
  const getContainer = () => {
    if (!env) {
      return container;
    }
    let value = container;
    for (const [key, envValue] of Object.entries(env)) {
      value = value.withEnvVariable(key, envValue);
    }
    return value;
  };
  try {
    const newContainer = await getContainer()
      .withWorkdir(path)
      .withExec([packageManager ?? config.nodePackageManager, ...args])
      .sync();
    return {
      state: "Success",
      container: newContainer,
    };
  } catch (error) {
    return {
      state: "Error",
      error,
    };
  }
};
