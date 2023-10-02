import * as _island_is_pipes_core from '@island-is/pipes-core';
import { Container, z, removeContextCommand, createModuleDef, PipesCoreModule, ModuleReturnType } from '@island-is/pipes-core';
import { Container as Container$1 } from '@dagger.io/dagger';

interface RunStateMessage {
    state: "Success";
    container: Container;
}
interface RunStateError {
    state: "Error";
    error: any;
}
declare const RunStateSchema: _island_is_pipes_core.ZodPromise<z.Schema<RunState, _island_is_pipes_core.ZodTypeDef, RunState>>;
type RunState = RunStateError | RunStateMessage;
declare const run: removeContextCommand<PipesNodeModule["Context"]["Implement"]["nodeRun"]>;

interface IPipesNodeConfig {
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
interface IPipesNodeContext {
    nodeModifyPackageJSON: (prop: {
        relativeCwd: string;
        fn: (value: any) => string | Promise<string>;
    }) => Promise<void>;
    nodeIsVersionGreaterOrEqual: (prop: {
        version: number;
    }) => Promise<boolean>;
    nodeAddEnv: (prop: {
        container?: Container$1;
        env: [string, string][];
    }) => Promise<Container$1>;
    nodeGetVersion: () => Promise<string>;
    nodeGetContainer: () => Promise<Container$1>;
    nodePrepareContainer: () => Promise<Container$1>;
    nodeRun: (props: {
        args: string[];
        relativeCwd?: string;
        packageManager?: IPipesNodeConfig["nodePackageManager"];
    }) => Promise<RunState>;
    nodeCompileAndRun: (props: {
        file: string;
        name: string;
        external: string[];
        container?: Container$1;
        output?: {
            output: "stdout";
        } | {
            output: "stderr";
        } | {
            file: string;
        } | {
            fileFromEnv: string;
        };
    }) => Promise<{
        error?: true | unknown;
        message: string;
        container: Container$1 | null;
    }>;
}
type PipesNodeModule = createModuleDef<"PipesNode", IPipesNodeContext, IPipesNodeConfig, [PipesCoreModule]>;

declare const PipesNodeContext: (prop: any) => PipesNodeModule["Context"]["Implement"];

declare const PipesNodeConfig: (prop: {
    z: typeof _island_is_pipes_core.z;
}) => {
    nodePackageManager: "yarn" | "npm" | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodUnion<(_island_is_pipes_core.ZodLiteral<"yarn"> | _island_is_pipes_core.ZodLiteral<"npm">)[]>>;
    nodeDebug: boolean | (_island_is_pipes_core.ZodBoolean | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodBoolean>);
    nodeVersion: string | (_island_is_pipes_core.ZodString | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodString>);
    nodeWorkDir: string | (_island_is_pipes_core.ZodString | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodString>);
    nodeSourceDir: string | (_island_is_pipes_core.ZodString | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodString>);
    nodeSourceIncludeOrExclude: "include" | "exclude" | "include-and-exclude" | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodUnion<(_island_is_pipes_core.ZodLiteral<"include"> | _island_is_pipes_core.ZodLiteral<"exclude"> | _island_is_pipes_core.ZodLiteral<"include-and-exclude">)[]>>;
    nodeSourceExclude: string[] | _island_is_pipes_core.ZodArray<_island_is_pipes_core.ZodString | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodString>, "many"> | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodArray<_island_is_pipes_core.ZodString | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodString>, "many">>;
    nodeSourceInclude: string[] | _island_is_pipes_core.ZodArray<_island_is_pipes_core.ZodString | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodString>, "many"> | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodArray<_island_is_pipes_core.ZodString | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodString>, "many">>;
    nodeImageKey: string | (_island_is_pipes_core.ZodString | _island_is_pipes_core.ZodDefault<_island_is_pipes_core.ZodString>);
};

declare const PipesNode: ModuleReturnType<PipesNodeModule>;

export { type IPipesNodeConfig, type IPipesNodeContext, PipesNode, PipesNodeConfig, PipesNodeContext, type PipesNodeModule, type RunState, type RunStateError, type RunStateMessage, RunStateSchema, run };
