import { createModule } from "@island-is/pipes-core";

import { GitHubConfig } from "./config/config.js";
import { GitHubContext } from "./context/context.js";

import type { PipesGitHubModule } from "./interface-module.js";
import type { ModuleReturnType, Simplify } from "@island-is/pipes-core";

export const PipesGitHub: Simplify<ModuleReturnType<PipesGitHubModule>> = createModule<PipesGitHubModule>({
  name: "PipesGitHub",
  config: GitHubConfig,
  context: GitHubContext,
  required: ["PipesCore"],
  optional: ["PipesNode"],
});
export type { PipesGitHubModule } from "./interface-module.js";
