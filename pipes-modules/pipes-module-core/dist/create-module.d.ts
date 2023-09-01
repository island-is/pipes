import { z } from "@island.is/zod";
import { createPipesContextCommand } from "./create-pipes-context-command.js";
import type { AnyModule, CreateModule, ModuleConfigValue, ModuleName, moduleNameToString, newModuleName } from "./types/module.js";
export declare function createModuleName<T extends string>(name: T): T;
export declare function createConfig<Module extends AnyModule, ConfigImplement = Module["Config"]["Implement"]>(fn: (prop: {
    z: typeof z;
}) => ConfigImplement): (prop: {
    z: typeof z;
}) => ConfigImplement;
export declare function createContext<Module extends AnyModule, ContextImplement = Module["Context"]["Implement"]>(fn: (prop: {
    z: typeof z;
    fn: <Value = undefined, Output = undefined>(props: Parameters<typeof createPipesContextCommand<Module, Value, Output>>[0]) => ReturnType<typeof createPipesContextCommand<Module, Value, Output>>;
}) => ContextImplement): typeof fn;
export declare const _createModule: <NewModule extends AnyModule, ConfigImplement = NewModule["Config"]["Implement"], ContextImplement = NewModule["Context"]["Implement"], RequiredNames extends string[] = NewModule["RequiredModules"][number]["ModuleName"] extends never ? [] : NewModule["RequiredModules"][number]["ModuleName"][], OptionalNames extends string[] = NewModule["OptionalModules"][number]["ModuleName"] extends never ? [] : NewModule["OptionalModules"][number]["ModuleName"][]>({ name, config, context, required, optional, }: {
    name: NewModule["ModuleName"];
    config: (value: {
        z: typeof z;
    }) => ConfigImplement;
    context: (value: {
        z: typeof z;
        fn: <Value = undefined, Output = undefined>(props: {
            value?: (undefined extends Value ? Value & undefined : import("./index.js").valueToZod<Value>) | undefined;
            output?: import("./index.js").valueToZod<Output> | undefined;
            implement: (context: NewModule["Context"]["ContextInterface"], config: NewModule["Config"]["Merged"], _value: Value) => Output;
        }) => import("./types/pipes-command.js").PipesContextCommand<NewModule, Value, Output>;
    }) => ContextImplement;
    required?: RequiredNames | undefined;
    optional?: OptionalNames | undefined;
}) => {
    name: NewModule["ModuleName"];
    config: ConfigImplement;
    context: ContextImplement;
    required: RequiredNames;
    optional: OptionalNames;
};
export declare function createModule<NewModule extends AnyModule, ConfigImplement = NewModule["Config"]["Implement"], ContextImplement = NewModule["Context"]["Implement"], RequiredNames extends ModuleName[] = NewModule["RequiredModules"][number]["ModuleName"] extends never ? [] : moduleNameToString<NewModule["RequiredModules"][number]["ModuleName"]>[], OptionalNames extends ModuleName[] = NewModule["OptionalModules"][number]["ModuleName"] extends never ? [] : moduleNameToString<NewModule["OptionalModules"][number]["ModuleName"]>[]>(param: {
    name: moduleNameToString<NewModule["ModuleName"]>;
    config: (value: {
        z: typeof z;
    }) => ConfigImplement;
    context: (value: {
        z: typeof z;
        fn: <Value = undefined, Output = undefined>(props: Parameters<typeof createPipesContextCommand<NewModule, Value, Output>>[0]) => ReturnType<typeof createPipesContextCommand<NewModule, Value, Output>>;
    }) => ContextImplement;
    required?: RequiredNames;
    optional?: OptionalNames;
}): {
    name: NewModule["ModuleName"];
    config: ConfigImplement;
    context: ContextImplement;
    required: RequiredNames;
    optional: OptionalNames;
};
export type createModuleDef<Name extends string, Definition, Config extends ModuleConfigValue<Config>, RequiredModules extends AnyModule[] = [], OptionalModules extends AnyModule[] = []> = CreateModule<newModuleName<Name>, Definition, Config, RequiredModules, OptionalModules>;
