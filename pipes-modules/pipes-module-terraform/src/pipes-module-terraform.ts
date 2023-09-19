/**
 * @file Core module for pipes
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path/posix";

import { createConfig, createContext, z } from "@island-is/pipes-core";

import { doesFileExists, getFilesFromPath } from "./util.js";

import type { Container, PipesCoreModule, Simplify, createModuleDef } from "@island-is/pipes-core";
/**
 * @file Core module for pipes
 */

const Name = z.string().min(1);
const Path = z.string().or(z.array(z.string())).describe("Path");

const TerraformEnvironment = z.object({
  name: Name,
  terraformDirectory: Path.default([]),
  terraformEnvVariables: z.record(z.string(), z.string()).default({}),
  terraformVersion: z.literal("AUTO").or(z.string()).default("AUTO").describe("The version of terraform to use"),
  terraformDefaultVersion: z.literal("NONE").or(z.string()).default("NONE"),
  terraformGoThroughSubdirectories: z.boolean().default(false).or(z.number()).default(false),
});

type TerraformEnvironment = Simplify<z.infer<typeof TerraformEnvironment>>;

export interface BaseEnvOutput {
  directories: string[];
}

interface IConfig {
  terraformRoot: string;
  terraformEnvironments: Record<string, TerraformEnvironment>;
}

interface IContext {
  terraformGetImage: (prop: { version: string }) => Container;
  terrafromRunPlan: () => Promise<void>;
  terrafromRunApply: () => Promise<void>;
  terraformBaseRunEnv: (props: { env: TerraformEnvironment }) => Promise<BaseEnvOutput>;
  terraformRunPlanOnEnv: (prop: { env: string }) => Promise<void>;
  terraformRunPlanOnDirectory: (prop: { path: string }) => Promise<void>;
  terraformGetVersionFromDirectory: (prop: { env: TerraformEnvironment; path: string }) => Promise<string>;
}

export type PipesTerraformModule = createModuleDef<"PipesTerraform", IContext, IConfig, [PipesCoreModule]>;

const TerraformConfig = createConfig<PipesTerraformModule>(({ z }) => ({
  terraformRoot: z.string().default(process.cwd()).describe("The root directory of terraform"),
  terraformEnvironments: z.custom<Record<string, TerraformEnvironment>>((value) => {
    if (typeof value !== "object" || !value) {
      throw new Error(`This should be a record`);
    }
    Object.entries(value).forEach(([key, keyValue]) => {
      if (typeof key !== "string") {
        throw new Error(`Key should be string`);
      }
      TerraformEnvironment.parse(keyValue);
    });
    return value;
  }),
}));

export const PathIncludesPath = (path: string, rootPath: string | string[]): boolean => {
  if (typeof rootPath === "string") {
    return path.startsWith(rootPath);
  }
  return !!rootPath.find((e) => path.startsWith(e));
};

const cache: Record<string, string> = {};

const TerraformContext = createContext<PipesTerraformModule>(({ z, fn }) => ({
  terrafromRunPlan: fn<{}, void>({
    value: z.object({}).default({}),
    output: z.custom<void>(),
    implement: (context, config) => {
      throw new Error("To do");
    },
  }),
  terrafromRunApply: fn<{}, void>({
    value: z.object({}).default({}),
    output: z.custom<void>(),
    implement: () => {
      throw new Error("To do");
    },
  }),
  terraformBaseRunEnv: fn<{ env: TerraformEnvironment }, Promise<BaseEnvOutput>>({
    value: z.object({ env: TerraformEnvironment }).default({ env: {} as TerraformEnvironment }),
    output: z.custom<Promise<BaseEnvOutput>>(),
    implement: async (context, config, { env }: { env: TerraformEnvironment }) => {
      const basePath = env.terraformDirectory;
      if (!basePath) {
        throw new Error(`No working directory found for ${env.name}`);
      }
      const checkPaths = async (
        basePath: string,
        shouldGoThroughSubdirectories = env.terraformGoThroughSubdirectories,
      ): Promise<string[]> => {
        const isWorkingPathAvailable = await doesFileExists(basePath);
        if (!isWorkingPathAvailable) {
          throw new Error(`Working directory not found for ${env} at ${basePath}`);
        }
        const nextSubdirectoryCheck =
          typeof shouldGoThroughSubdirectories == "number"
            ? shouldGoThroughSubdirectories - 1
            : shouldGoThroughSubdirectories;
        const hasTerraform = (await getFilesFromPath({ path: basePath, extension: ".tf" })).length > 0;
        const subdirectories = await Promise.all(
          shouldGoThroughSubdirectories
            ? (await getFilesFromPath({ path: basePath, directory: true })).map((e) =>
                checkPaths(e, nextSubdirectoryCheck),
              )
            : [],
        );
        return hasTerraform ? [basePath, ...subdirectories].flat() : subdirectories.flat();
      };
      const directories = (
        await Promise.all(
          Array.isArray(basePath)
            ? basePath.map((path) => checkPaths(path)).flat()
            : (await checkPaths(basePath)).flat(),
        )
      ).flat();

      return {
        directories,
      };
    },
  }),
  terraformRunPlanOnEnv: fn<{ env: string }, Promise<void>>({
    value: z.object({ env: z.string() }).default({ env: "" }),
    output: z.custom<Promise<void>>(),
    implement: (context, config, prop: { env: string }) => {
      throw new Error("To do");
    },
  }),
  terraformRunPlanOnDirectory: fn<{ path: string }, Promise<void>>({
    value: z.object({ path: z.string() }).default({ path: "" }),
    output: z.custom<Promise<void>>(),
    implement: (context, config, prop: { path: string }) => {
      throw new Error("To do");
    },
  }),
  terraformGetVersionFromDirectory: fn<{ path: string; env: TerraformEnvironment }, Promise<string>>({
    value: z.custom<{ path: string; env: TerraformEnvironment }>((value) => {
      if (typeof value !== "object" || !value) {
        throw new Error(`Incorrect parameters`);
      }
      if (!("path" in value)) {
        throw new Error(`Incorrect parameter, path missing`);
      }
      if (!("env" in value)) {
        throw new Error(`Incorrect parameter, env missing`);
      }
      Path.parse(value.path);
      TerraformEnvironment.parse(value.env);
    }),
    output: z.custom<Promise<string>>(),
    implement: async (context, config, { env, path }) => {
      if (!PathIncludesPath(path, env.terraformDirectory)) {
        throw new Error(
          // eslint-disable-next-line max-len
          `${path} cannot by used ${env.name} - path is not a subdirectory of env\n Possible reason: Traveled too far to find version file?`,
        );
      }
      // Force usage of this version
      if (env.terraformVersion !== "AUTO") {
        return env.terraformVersion;
      }
      // Cached answer
      if (cache[path]) {
        return cache[path];
      }

      try {
        const terraformVersionPath = join(path, ".terraform-version");
        const content = await readFile(terraformVersionPath, "utf-8");
        cache[path] = content;
        return content;
      } catch {
        // Travel further to find version
        const value = await context.terraformGetVersionFromDirectory({ path: join(path, ".."), env });
        cache[path] = value;
        return value;
      }
    },
  }),
  terraformGetImage: fn<{ version: string }, Container>({
    value: z.object({ version: z.string() }).default({ version: "AUTO" }),
    output: z.custom<Container>(),
    implement: (context, config, { version }) => {
      return context.client.container().from(`hashicorp/terraform:${version}`);
    },
  }),
}));
