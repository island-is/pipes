import { z } from "./zod.js";

import type { zinfer } from "./zod.js";

const pipeWorkspace = z
  .object({
    changesGlobalLintHash: z.boolean().default(false),
    skipGlobalResolution: z.boolean().default(false),
    skipBuild: z.boolean().default(false),
    skipTest: z.boolean().default(false),
    skipLint: z.boolean().default(false),
    publishFields: z.union([z.literal(false), z.array(z.string())]).default(false),
    publishFiles: z.union([z.literal(false), z.array(z.string())]).default(false),
    buildWithRollup: z.boolean().default(false),
  })
  .default({});

export type WorkspaceConfig = zinfer<typeof pipeWorkspace>;

export function getWorkspaceConfig(packageJSONRaw: unknown): zinfer<typeof pipeWorkspace> {
  let config: zinfer<typeof pipeWorkspace>;
  if (packageJSONRaw && typeof packageJSONRaw === "object" && "pipes" in packageJSONRaw) {
    config = pipeWorkspace.parse(packageJSONRaw.pipes);
  } else {
    config = pipeWorkspace.parse(undefined);
  }
  return config;
}
