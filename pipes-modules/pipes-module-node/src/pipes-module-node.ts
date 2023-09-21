/**
 * @file Core module for pipes
 */
import { basename, join } from "node:path/posix";

import { Container, createConfig, createContext, createModule, getNvmVersion } from "@island-is/pipes-core";

import { compileFile } from "./build.js";

import type { PipesCoreModule, Simplify, createModuleDef } from "@island-is/pipes-core";

interface IPipesNodeConfig {
  nodeVersion: "AUTO" | string;
  nodeWorkDir: string;
  nodeSourceDir: string;
  nodeSourceIncludeOrExclude: "include" | "exclude" | "include-and-exclude";
  nodeSourceExclude: string[];
  nodeSourceInclude: string[];
  nodeImageKey: string;
}

interface IPipesNodeContext {
  nodeAddEnv: (prop: { container?: Container; env: [string, string][] }) => Promise<Container>;
  nodeGetVersion: () => Promise<string>;
  nodeGetContainer: () => Promise<Container>;
  nodePrepareContainer: () => Promise<Container>;
  nodeCompileAndRun: (props: {
    file: string;
    name: string;
    external: string[];
    container?: Container;
    output?: { output: "stdout" } | { output: "stderr" } | { file: string } | { fileFromEnv: string };
  }) => Promise<{ error?: true | unknown; message: string; container: Container | null }>;
}

export type PipesNodeModule = createModuleDef<"PipesNode", IPipesNodeContext, IPipesNodeConfig, [PipesCoreModule]>;

const PipesNodeConfig = createConfig<PipesNodeModule>(({ z }) => ({
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

const PipesNodeContext = createContext<PipesNodeModule>(({ z, fn }): PipesNodeModule["Context"]["Implement"] => ({
  nodeAddEnv: fn<{ container?: Container; env: [string, string][] }, Promise<Container>>({
    value: z.object({ container: z.custom<Container>().optional(), env: z.array(z.tuple([z.string(), z.string()])) }),
    output: z.custom<Promise<Container>>((val) => val),
    implement: async (context, config, { container, env }) => {
      const imageStore = await context.imageStore;
      const usedContainer = container || (await imageStore.awaitForAvailability(`node-${config.nodeImageKey}`));
      const newContainer = context.addEnv({ container: usedContainer, env });
      return newContainer;
    },
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
    implement: async (context, config, { container, name, file, external, output = { output: "stdout" } }) => {
      let value: Container;
      const getMessage = async (messageContainer: Container) => {
        if (!messageContainer) {
          throw new Error("Container unassigned");
        }
        if ("output" in output) {
          if (output.output === "stdout") {
            return messageContainer.stdout();
          }
          if (output.output === "stderr") {
            return messageContainer.stderr();
          }
        }
        if ("file" in output) {
          const outputFile = (await messageContainer.file(output.file).sync()).contents();
          return outputFile;
        }
        if ("fileFromEnv" in output) {
          const fileName = await messageContainer.envVariable(output.fileFromEnv);
          const outputFile = await (await messageContainer.file(fileName).sync()).contents();
          return outputFile;
        }
        // Default behaviour
        return messageContainer.stdout();
      };
      try {
        const tmpFile = await compileFile(file, external, name);
        const imageStore = await context.imageStore;
        value = await (container ?? imageStore.awaitForAvailability(`node-${config.nodeImageKey}`));
        const tmpFileRef = context.client.host().file(tmpFile);
        value = await (
          await value
            .withWorkdir(config.nodeWorkDir)
            .withFile(join(config.nodeWorkDir, basename(tmpFile)), tmpFileRef)
            .withExec(["yarn", "node", basename(tmpFile)])
            .sync()
        )
          .withExec(["rm", basename(tmpFile)])
          .sync();
        return {
          message: await getMessage(value),
          container: value,
        };
      } catch (e) {
        const message = await (() => {
          try {
            /* @ts-expect-error - this could been unassigned */
            return getMessage(value);
          } catch {
            return `Error occured with ${file} using prefix: ${name}`;
          }
        })();
        return {
          error: e,
          message,
          container: null,
        };
      }
    },
  }),
  nodeGetVersion: fn<undefined, Promise<string>>({
    value: undefined,
    output: z.custom<Promise<string>>((val) => {
      // FIX PROMISE VALIDATION
      return val;
    }),
    implement: async (_context, config) => {
      if (config.nodeVersion === "AUTO") {
        // TODO move to async:
        const nodeVersion = await getNvmVersion(config.nodeSourceDir);
        config.nodeVersion = nodeVersion;
      }
      // No need to call this again. The version has been set for the context.
      return config.nodeVersion;
    },
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
    implement: async (context, config) => {
      return (await context.imageStore).getOrSet(`node-${config.nodeImageKey}`, async () => {
        const container = await context.nodeGetContainer();
        const sourceOptions = {
          ...(config.nodeSourceIncludeOrExclude === "include" ||
          config.nodeSourceIncludeOrExclude === "include-and-exclude"
            ? {
                include: config.nodeSourceInclude,
              }
            : {}),
          ...(config.nodeSourceIncludeOrExclude === "exclude" ||
          config.nodeSourceIncludeOrExclude === "include-and-exclude"
            ? {
                exclude: config.nodeSourceExclude,
              }
            : {}),
        };
        // Currently we are just using yarn
        const source = context.client.host().directory(config.nodeSourceDir, sourceOptions);
        const corepack = await container
          .withDirectory(config.nodeWorkDir, source)
          .withWorkdir(config.nodeWorkDir)
          .withExec(["corepack", "enable"])
          .sync();
        const yarnInstall = await corepack.withExec(["yarn", "install"]).sync();
        return yarnInstall;
      });
    },
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
    implement: async (context, _config) => {
      const version = await context.nodeGetVersion();
      return (await context.imageStore).getOrSet(`base-node-${version}`, () => {
        const container = context.client.container().from(`node:${version}`);
        return container;
      });
    },
  }),
}));

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
