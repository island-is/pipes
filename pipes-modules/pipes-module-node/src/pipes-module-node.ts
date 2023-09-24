/**
 * @file Core module for pipes
 */

import { createModule } from "@island-is/pipes-core";

import { PipesNodeConfig } from "./config.js";
import { PipesNodeContext } from "./context.js";

import type { PipesNodeModule } from "./interface.js";
import type { Simplify } from "@island-is/pipes-core";

export const PipesNode: {
  name: "PipesNode";
  config: Simplify<PipesNodeModule["Config"]["Implement"]>;
  context: Simplify<PipesNodeModule["Context"]["Implement"]>;
  required: "PipesCore"[];
  optional: [];
} = createModule<PipesNodeModule>({
  name: "PipesNode",
  config: PipesNodeConfig,
  context: PipesNodeContext,
  required: ["PipesCore"],
});
export type { PipesNodeModule, IPipesNodeContext, IPipesNodeConfig } from "./interface.js";
