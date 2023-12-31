import type { RunState } from "./context/run.js";
import type { Container } from "@dagger.io/dagger";
import type { PipesCoreModule, createModuleDef } from "@island.is/pipes-core";

export interface IPipesNodeConfig {
  nodePackageManager: "yarn" | "npm";
  nodeDebug: boolean;
  nodeVersion: "AUTO" | string;
  nodeWorkDir: string;
  nodeSourceDir: string;
  nodeSourceIncludeOrExclude: "include" | "exclude" | "include-and-exclude";
  nodeSourceExclude: string[];
  nodeSourceInclude: string[];
  nodeImageKey: string;
}

export interface IPipesNodeContext {
  nodePublish: (prop: {
    token: string;
    relativeWorkDir: string;
    email: string;
    version: string;
    access?: "public" | "restricted";
    container?: Container | undefined;
    unpublish?: "ifExists" | "always" | "never";
  }) => Promise<void>;
  nodeModifyPackageJSON: (prop: { relativeCwd: string; fn: (value: any) => string | Promise<string> }) => Promise<void>;
  nodeIsVersionGreaterOrEqual: (prop: { version: number }) => Promise<boolean>;
  nodeAddEnv: (prop: { container?: Container; env: [string, string][] }) => Promise<Container>;
  nodeGetVersion: () => Promise<string>;
  nodeGetContainer: () => Promise<Container>;
  nodePrepareContainer: () => Promise<Container>;
  nodeRun: (props: {
    args: string[];
    env?: Record<string, string>;
    relativeCwd?: string;
    packageManager?: IPipesNodeConfig["nodePackageManager"];
  }) => Promise<RunState>;
  nodeCompileAndRun: (props: {
    file: string;
    name: string;
    external: string[];
    container?: Container;
    output?: { output: "stdout" } | { output: "stderr" } | { file: string } | { fileFromEnv: string };
  }) => Promise<{ error?: true | unknown; message: string; container: Container | null }>;
}

export type PipesNodeModule = createModuleDef<"PipesNode", IPipesNodeContext, IPipesNodeConfig, [PipesCoreModule]>;
