import { Client } from "@dagger.io/dagger";
import { type PipesCoreModule } from "./pipes-core-module.js";
import type { AnyModule, MergeModules, ModuleName } from "./types/module.js";
import type { PipesContextCommandBase } from "./types/pipes-command.js";
export declare class PipesCoreClass<Modules extends AnyModule[] = [PipesCoreModule], CurrentState extends MergeModules<Modules> = MergeModules<Modules>, CurrentConfig extends CurrentState["Config"] = CurrentState["Config"], CurrentContext extends CurrentState["Context"] = CurrentState["Context"], ScriptFn extends fn<CurrentContext["ContextInterface"], CurrentConfig["Merged"]> = fn<CurrentContext["ContextInterface"], CurrentConfig["Merged"]>> {
    #private;
    addScript(fn: ScriptFn): this;
    set haltAll(value: () => void | Promise<void>);
    get haltAll(): () => void;
    config: CurrentConfig["Merged"];
    context: {
        [key in keyof CurrentContext["OutsideInterface"]]: CurrentContext["OutsideInterface"][key] extends PipesContextCommandBase ? Diff<CurrentContext["OutsideInterface"][key], PipesContextCommandBase> : CurrentContext["OutsideInterface"][key];
    };
    constructor({ modules, schemas: { config, context }, }: {
        modules: ModuleName[];
        schemas: {
            config: CurrentConfig["MergedImplement"];
            context: CurrentContext["MergedImplement"];
        };
    });
    get isReady(): boolean;
    get modules(): ModuleName[];
    hasModule(moduleName: string): boolean;
    addModule<T extends AnyModule>(module: ModuleReturnType<T>): PipesCoreClass<[T, ...Modules]>;
    set client(client: Client);
    get client(): Client;
    run(): Promise<void>;
}
export declare const createPipesCore: () => PipesCoreClass<[PipesCoreModule]>;
export declare const ContextHasModule: <T extends unknown, K extends keyof T, Context extends Partial<T>>(context: unknown, key: K) => context is Required<Pick<Context, keyof T>> & Omit<Context, keyof T> extends infer T_1 ? { [KeyType_1 in keyof T_1]: (Required<Pick<Context, keyof T>> & Omit<Context, keyof T>)[KeyType_1]; } : never;
export declare const ConfigHasModule: <T extends unknown, K extends keyof T, Config extends Partial<T>>(config: unknown, key: K) => config is Required<Pick<Config, keyof T>> & Omit<Config, keyof T> extends infer T_1 ? { [KeyType_1 in keyof T_1]: (Required<Pick<Config, keyof T>> & Omit<Config, keyof T>)[KeyType_1]; } : never;
type ModuleReturnType<NewModule extends AnyModule> = {
    name: NewModule["ModuleName"];
    config: NewModule["Config"]["Implement"];
    context: NewModule["Context"]["Implement"];
    required: NewModule["RequiredModules"][number]["ModuleName"] extends never ? [] : NewModule["RequiredModules"][number]["ModuleName"][];
    optional: NewModule["OptionalModules"][number]["ModuleName"] extends never ? [] : NewModule["OptionalModules"][number]["ModuleName"][];
};
type fn<Context extends any, Config extends any> = (context: Context, config: Config) => Promise<void> | void;
type Diff<T, U> = T extends any & U ? (T extends infer R & U ? R : never) : never;
export {};
