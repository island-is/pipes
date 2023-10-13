import type { IGitHubConfig } from "./interface-config.js";
import type { IGitHubContext } from "./interface-context.js";
import type { PipesCoreModule, createModuleDef } from "@island.is/pipes-core";
// These types need to be imported for the build to work!
// eslint-disable-next-line unused-imports/no-unused-imports
import type { PipesNodeModule, RunStateError, RunStateMessage } from "@island.is/pipes-module-node";

export type PipesGitHubModule = createModuleDef<
  "PipesGitHub",
  IGitHubContext,
  IGitHubConfig,
  [PipesCoreModule],
  [PipesNodeModule]
>;
