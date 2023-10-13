import { z } from "@island.is/pipes-core";

const pipeWorkspace = z
  .object({
    changesGlobalLintHash: z.boolean().default(false),
    skipGlobalResolution: z.boolean().default(false),
    skipBuild: z.boolean().default(false),
    skipTest: z.boolean().default(false),
    skipLint: z.boolean().default(false),
    publishFieldsOverwrite: z.record(z.string(), z.any()).default({}),
    publishFields: z.union([z.literal(false), z.array(z.string())]).default(false),
    publishFiles: z.union([z.literal(false), z.array(z.string())]).default(false),
    buildWithRollup: z.boolean().default(false),
  })
  .default({});

export type WorkspaceConfig = z.infer<typeof pipeWorkspace>;

export function getWorkspaceConfig(packageJSONRaw: unknown): z.infer<typeof pipeWorkspace> {
  let config: z.infer<typeof pipeWorkspace>;
  if (packageJSONRaw && typeof packageJSONRaw === "object" && "pipes" in packageJSONRaw) {
    config = pipeWorkspace.parse(packageJSONRaw.pipes);
  } else {
    config = pipeWorkspace.parse(undefined);
  }
  return config;
}
