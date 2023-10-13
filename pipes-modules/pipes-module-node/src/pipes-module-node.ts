/**
 * @file Core module for pipes
 */

import { createModule } from "@island.is/pipes-core";

import { PipesNodeConfig } from "./config.js";
import { PipesNodeContext } from "./context.js";

import type { PipesNodeModule } from "./interface.js";
import type { ModuleReturnType } from "@island.is/pipes-core";

export const PipesNode: ModuleReturnType<PipesNodeModule> = createModule<PipesNodeModule>({
  name: "PipesNode",
  config: PipesNodeConfig,
  context: PipesNodeContext,
  required: ["PipesCore"],
});
export * from "./interface.js";
export * from "./context/run.js";
export * from "./context.js";
export * from "./config.js";
export type { PipesNodeModule, IPipesNodeContext, IPipesNodeConfig } from "./interface.js";
