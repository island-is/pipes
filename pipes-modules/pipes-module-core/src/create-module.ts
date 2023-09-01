/**
 * @file Create Pipes Context Module
 */
import { z } from "@island.is/zod";

import { createPipesContextCommand } from "./create-pipes-context-command.js";

import type {
  AnyModule,
  CreateModule,
  ModuleConfigValue,
  ModuleName,
  moduleNameToString,
  newModuleName,
} from "./types/module.js";

export function createModuleName<T extends string>(name: T): T {
  return name;
}

export function createConfig<Module extends AnyModule, ConfigImplement = Module["Config"]["Implement"]>(
  fn: (prop: { z: typeof z }) => ConfigImplement,
): (prop: { z: typeof z }) => ConfigImplement {
  return fn;
}

export function createContext<Module extends AnyModule, ContextImplement = Module["Context"]["Implement"]>(
  fn: (prop: {
    z: typeof z;
    fn: <Value = undefined, Output = undefined>(
      props: Parameters<typeof createPipesContextCommand<Module, Value, Output>>[0],
    ) => ReturnType<typeof createPipesContextCommand<Module, Value, Output>>;
  }) => ContextImplement,
): typeof fn {
  return fn;
}

export const _createModule = <
  NewModule extends AnyModule,
  ConfigImplement = NewModule["Config"]["Implement"],
  ContextImplement = NewModule["Context"]["Implement"],
  RequiredNames extends ModuleName[] = NewModule["RequiredModules"][number]["ModuleName"] extends never
    ? []
    : moduleNameToString<NewModule["RequiredModules"][number]["ModuleName"]>[],
  OptionalNames extends ModuleName[] = NewModule["OptionalModules"][number]["ModuleName"] extends never
    ? []
    : moduleNameToString<NewModule["OptionalModules"][number]["ModuleName"]>[],
>({
  name,
  config,
  context,
  required = [] as unknown as RequiredNames,
  optional = [] as unknown as OptionalNames,
}: {
  name: moduleNameToString<NewModule["ModuleName"]>;
  config: (value: { z: typeof z }) => ConfigImplement;
  context: (value: {
    z: typeof z;
    fn: <Value = undefined, Output = undefined>(
      props: Parameters<typeof createPipesContextCommand<NewModule, Value, Output>>[0],
    ) => ReturnType<typeof createPipesContextCommand<NewModule, Value, Output>>;
  }) => ContextImplement;
  required?: RequiredNames;
  optional?: OptionalNames;
}): {
  name: NewModule["ModuleName"];
  config: ConfigImplement;
  context: ContextImplement;
  required: RequiredNames;
  optional: OptionalNames;
} => {
  const fn = <Value = undefined, Output = undefined>(
    props: Parameters<typeof createPipesContextCommand<NewModule, Value, Output>>[0],
  ) => createPipesContextCommand<NewModule, Value, Output>(props);
  return {
    name,
    config: config({ z }),
    context: context({ z, fn }),
    required: required.map((e) => createModuleName(e)) as RequiredNames,
    optional: optional.map((e) => createModuleName(e)) as OptionalNames,
  };
};

// NOTICE: We reintroduce alot of typing here so modules can be safely isolated.
export function createModule<
  NewModule extends AnyModule,
  ConfigImplement = NewModule["Config"]["Implement"],
  ContextImplement = NewModule["Context"]["Implement"],
  RequiredNames extends ModuleName[] = NewModule["RequiredModules"][number]["ModuleName"] extends never
    ? []
    : moduleNameToString<NewModule["RequiredModules"][number]["ModuleName"]>[],
  OptionalNames extends ModuleName[] = NewModule["OptionalModules"][number]["ModuleName"] extends never
    ? []
    : moduleNameToString<NewModule["OptionalModules"][number]["ModuleName"]>[],
>(param: {
  name: moduleNameToString<NewModule["ModuleName"]>;
  config: (value: { z: typeof z }) => ConfigImplement;
  context: (value: {
    z: typeof z;
    fn: <Value = undefined, Output = undefined>(
      props: Parameters<typeof createPipesContextCommand<NewModule, Value, Output>>[0],
    ) => ReturnType<typeof createPipesContextCommand<NewModule, Value, Output>>;
  }) => ContextImplement;
  required?: RequiredNames;
  optional?: OptionalNames;
}): {
  name: NewModule["ModuleName"];
  config: ConfigImplement;
  context: ContextImplement;
  required: RequiredNames;
  optional: OptionalNames;
} {
  return _createModule<NewModule, ConfigImplement, ContextImplement, RequiredNames, OptionalNames>(param);
}
export type createModuleDef<
  Name extends string,
  Definition,
  Config extends ModuleConfigValue<Config>,
  RequiredModules extends AnyModule[] = [],
  OptionalModules extends AnyModule[] = [],
> = CreateModule<newModuleName<Name>, Definition, Config, RequiredModules, OptionalModules>;
