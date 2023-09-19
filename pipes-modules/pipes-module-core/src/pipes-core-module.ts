/* eslint-disable no-shadow */
/**
 * @file Core module for pipes
 */
import { Client, Container } from "@dagger.io/dagger";
import { createGlobalZodKeyStore } from "@island-is/zod";
import ciinfo from "ci-info";

// eslint-disable-next-line sort-imports
import { createConfig, createContext, createModule as _createModule } from "./create-module.js";

import type { createModuleDef as _createModuleDef } from "./create-module.js";
import type { AnyModule, ModuleName, moduleNameToString } from "./types/module.js";
import type { createZodKeyStore, z } from "@island-is/zod";

interface IPipesCoreContext {
  client: Client;
  haltAll: () => void;
  modules: ModuleName[];
  stack: string[];
  hasModule: <Module extends AnyModule>(name: moduleNameToString<Module["ModuleName"]>) => boolean;
  imageStore: Promise<ReturnType<typeof createZodKeyStore<z.ZodType<Container>>>>;
  addEnv: (prop: { container: Container; env: [string, string][] }) => Container;
}

interface IPipesCoreConfig {
  appName: string;
  isCI: boolean;
  isPR: boolean;
  env: "github" | "gitlab" | "local";
}

export type PipesCoreModule = _createModuleDef<"PipesCore", IPipesCoreContext, IPipesCoreConfig>;

const PipesCoreConfig = createConfig<PipesCoreModule>(({ z }) => ({
  appName: z.string().default("pipes").describe("The name of the context"),
  env: z
    .union([z.literal("github"), z.literal("gitlab"), z.literal("local")])
    .default(() => {
      if (ciinfo.GITLAB) {
        return "gitlab";
      }
      if (ciinfo.GITHUB_ACTIONS) {
        return "github";
      }
      return "local";
    })
    .describe("The environment the code is running in"),
  isCI: z
    .boolean()
    .default(ciinfo.isCI, {
      env: "ci",
      arg: {
        long: "isCI",
        short: "c",
      },
    })
    .describe("Is the current environment a CI environment"),
  isPR: z
    .boolean()
    .default(ciinfo.isPR || false)
    .describe("Is the current environment a PR environment"),
}));

const PipesCoreContext = createContext<PipesCoreModule>(({ z, fn }): PipesCoreModule["Context"]["Implement"] => ({
  haltAll: fn<undefined, undefined>({
    implement: () => {},
  }),
  addEnv: fn<{ container: Container; env: [string, string][] }, Container>({
    output: z.custom<Container>(),
    value: z.object({ container: z.custom<Container>(), env: z.array(z.tuple([z.string(), z.string()])) }),
    implement: (_context, _config, { container, env }) => {
      let newContainer = container;
      for (const [key, value] of env) {
        newContainer = newContainer.withEnvVariable(key, value);
      }
      return newContainer;
    },
  }),
  modules: z.array(z.string()).default([]).describe("The modules to load"),
  stack: z.array(z.string()).default([]).describe("The caller stack"),
  imageStore: z.custom<Promise<ReturnType<typeof createZodKeyStore<z.ZodType<Container>>>>>(() => {
    return createGlobalZodKeyStore(
      z.custom<Container>((val) => {
        if (val instanceof Container) {
          return val;
        }
        throw new Error("Invalid value");
      }),
      "PIPES-IMAGE-STORE",
    );
  }),
  client: z.custom<Client>((val) => {
    if (val instanceof Client) {
      return val;
    }
    throw new Error("Provided client is not an instance of the expected Client class.");
  }),
  hasModule: fn<string, boolean>({
    output: z.boolean(),
    value: z.string(),
    implement: (context, _config, value) => {
      return context.modules.includes(value as any);
    },
  }),
}));

export const PipesCore: {
  name: PipesCoreModule["ModuleName"];
  config: PipesCoreModule["Config"]["Implement"];
  context: PipesCoreModule["Context"]["Implement"];
} = _createModule<PipesCoreModule>({
  name: "PipesCore",
  config: PipesCoreConfig,
  context: PipesCoreContext,
});
