import { createConfig } from "@island-is/pipes-core";

import type { PipesNodeModule } from "./interface.js";

export const PipesNodeConfig = createConfig<PipesNodeModule>(({ z }) => ({
  nodeDebug: z
    .boolean()
    .default(false, {
      env: "NODE_DEBUG",
      arg: {
        long: "nodeDebug",
      },
    })
    .describe("Extra debug information for node module"),
  nodePackageManager: z.union([z.literal("yarn"), z.literal("npm")]).default("yarn"),
  nodeImageKey: z.string().default("node-dev"),
  nodeWorkDir: z.string().default("/apps"),
  nodeSourceDir: z.string().default(process.cwd()),
  nodeSourceIncludeOrExclude: z
    .union([z.literal("include"), z.literal("exclude"), z.literal("include-and-exclude")])
    .default("exclude"),
  nodeSourceInclude: z.array(z.string()).default([]),
  nodeSourceExclude: z
    .array(z.string())
    .default([".env*", "**/node_modules", "node_modules", ".yarn/cache", ".yarn/install-state.gz", ".yarn/unplugged"]),
  nodeVersion: z.string().default("AUTO"),
}));
