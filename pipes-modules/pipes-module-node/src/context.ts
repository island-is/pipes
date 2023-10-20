import { Container } from "@dagger.io/dagger";
import { createContext } from "@island.is/pipes-core";

import {
  RunStateSchema,
  addEnv,
  compileAndRun,
  getContainer,
  getVersion,
  isVersionGreaterOrEqual,
  modifyPackageJSON,
  prepareContainer,
  run,
} from "./context/context.js";
import { NodePublish, NodePublishParseInput, NodePublishParseOutput } from "./context/publish.js";

import type { RunState } from "./context/context.js";
import type { NodePublishInput, NodePublishOutput } from "./context/publish.js";
import type { PipesNodeModule } from "./interface.js";

export const PipesNodeContext: (prop: any) => PipesNodeModule["Context"]["Implement"] = createContext<PipesNodeModule>(
  ({ z, fn }): PipesNodeModule["Context"]["Implement"] => ({
    nodePublish: fn<NodePublishInput, NodePublishOutput>({
      value: NodePublishParseInput,
      output: NodePublishParseOutput,
      implement: NodePublish,
    }),
    nodeModifyPackageJSON: fn<{ relativeCwd: string; fn: (value: any) => any | Promise<any> }, Promise<void>>({
      value: z.object({ relativeCwd: z.string(), fn: z.function(z.tuple([z.any()]), z.any()) }),
      output: z.promise(z.void()),
      implement: modifyPackageJSON,
    }),
    nodeIsVersionGreaterOrEqual: fn<{ version: number }, Promise<boolean>>({
      value: z.object({ version: z.number() }),
      output: z.promise(z.boolean()),
      implement: isVersionGreaterOrEqual,
    }),
    nodeRun: fn<{ args: string[]; relativeCwd?: string }, Promise<RunState>>({
      value: z.object({
        args: z.array(z.string().default(".")),
        relativeCwd: z.string().optional(),
        env: z.record(z.string(), z.string()).optional(),
        packageManager: z.union([z.literal("yarn"), z.literal("npm")]).optional(),
      }),
      output: RunStateSchema,
      implement: run,
    }),
    nodeAddEnv: fn<{ container?: Container; env: [string, string][] }, Promise<Container>>({
      value: z.object({ container: z.custom<Container>().optional(), env: z.array(z.tuple([z.string(), z.string()])) }),
      output: z.custom<Promise<Container>>((val) => val),
      implement: addEnv,
    }),
    nodeCompileAndRun: fn<
      {
        file: string;
        external: string[];
        name: string;
        container?: Container;
        output?: { output: "stdout" } | { output: "stderr" } | { file: string } | { fileFromEnv: string };
      },
      Promise<{ error?: true | unknown; message: string; container: Container | null }>
    >({
      value: z.object({
        container: z.custom<Container>().optional(),
        file: z.string(),
        name: z.string(),
        output: z
          .union([
            z.object({ output: z.literal("stdout") }),
            z.object({ output: z.literal("stderr") }),
            z.object({ file: z.string() }),
            z.object({ fileFromEnv: z.string() }),
          ])
          .default({ output: "stdout" })
          .optional(),
        external: z.array(z.string()).default([]),
        env: z.record(z.string(), z.string()).default({}),
      }),
      output: z.custom<Promise<{ error?: true | unknown; message: string; container: Container | null }>>((val) => {
        return val;
      }),
      implement: compileAndRun,
    }),
    nodeGetVersion: fn<undefined, Promise<string>>({
      value: undefined,
      output: z.promise(z.string()),
      implement: getVersion,
    }),
    nodePrepareContainer: fn<undefined, Promise<Container>>({
      output: z.promise(
        z.custom<Container>((val) => {
          if (val instanceof Container) {
            return val;
          }
          throw new Error(`Invalid value`);
        }),
      ),
      implement: prepareContainer,
    }),
    nodeGetContainer: fn<undefined, Promise<Container>>({
      output: z.promise(
        z.custom<Container>((val) => {
          if (val instanceof Container) {
            return val;
          }
          throw new Error(`Invalid value`);
        }),
      ),
      implement: getContainer,
    }),
  }),
);
