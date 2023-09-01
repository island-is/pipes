import { Client, Container } from "@dagger.io/dagger";
import type { createModuleDef as _createModuleDef } from "./create-module.js";
import type { AnyModule, ModuleName, moduleNameToString } from "./types/module.js";
import type { createZodKeyStore, z } from "@island.is/zod";
interface IPipesCoreContext {
    client: Client;
    haltAll: () => void;
    modules: ModuleName[];
    stack: string[];
    hasModule: <Module extends AnyModule>(name: moduleNameToString<Module["ModuleName"]>) => boolean;
    imageStore: Promise<ReturnType<typeof createZodKeyStore<z.ZodType<Container>>>>;
    addEnv: (prop: {
        container: Container;
        env: [string, string][];
    }) => Container;
}
interface IPipesCoreConfig {
    appName: string;
    isCI: boolean;
    isPR: boolean;
    env: "github" | "gitlab" | "local";
}
export type PipesCoreModule = _createModuleDef<"PipesCore", IPipesCoreContext, IPipesCoreConfig>;
export declare const PipesCore: {
    name: PipesCoreModule["ModuleName"];
    config: PipesCoreModule["Config"]["Implement"];
    context: PipesCoreModule["Context"]["Implement"];
};
export {};
