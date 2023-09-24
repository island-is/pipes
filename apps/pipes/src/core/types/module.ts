/**
 * This module provides a set of TypeScript type definitions for managing "Modules" in a sophisticated system.
 *
 * A "Module" here is defined as an entity with a Name, a Definition, a Config, and a Context.
 * The Context itself is broken down into three parts: ContextInterface, OutsideInterface, and Implement.
 * Modules can have dependencies on other modules, which are classified as either RequiredModules or OptionalModules.
 *
 * There are numerous utility types defined in this module that aid in creating and managing these modules:
 * - MergeStateHelper: Helps merge module states based on string keys, and applies typing to determine the final state.
 * - MergeOutsideInterface: Merges the outside interfaces of modules.
 * - MergeConfig: Merges the configs of modules.
 *
 * FunctionKeys,
 * NonFunctionKeys,
 * ReplaceFunctionKeys,
 * ReplaceImplementation,
 * are utility types used for transforming the context,
 * specifically for changing functions and non-functions in the context and implementing them.
 *
 * The two main types that should be used directly by programmers are `createModule` and `newModuleName`:
 * - `createModule` is a type function that uses the utility types to define a complete "Module" type.
 *   It handles the merging of configurations and outside interfaces from
 *   required and optional modules, generates the final
 *   implementation, and forms the new context.
 * - `newModuleName` is used to enforce the naming scheme of modules.
 *
 * This module's extensive and complex TypeScript typings allow for
 * maintaining safety and consistency across your codebase,
 * especially when working with interdependent modules in a complex system.
 */

import type { addParameters } from "./add-parameters.js";
import type { ifIsNotZero } from "./both-are-zero.js";
import type { changeFunctionToPipes } from "./change-function-to-pipes.js";
import type { EmptyObject } from "./empty-object.js";
import type { getNestedObject, isNestedKey } from "./get-nested.js";
import type { Simplify } from "./simplify.js";
import type { SubsetKeys } from "./subsetkeys.js";
import type { unionToIntersection } from "./union-to-intersection.js";
import type { valueToZod } from "./value-to-zod.js";
import type { withoutNever } from "./without-never.js";

/**
 * Type function to create a new module.
 * Handles merging of configurations and outside interfaces from dependencies,
 * generates the final implementation, and forms the new context.
 */
export type CreateModule<
  Name extends ModuleName,
  Definition,
  Config extends ModuleConfigValue<Config>,
  RequiredModules extends AnyModule[] = [],
  OptionalModules extends AnyModule[] = [],
  MergedInterface extends ModuleContextInterface<MergedInterface> = MergeOutsideInterface<
    Definition,
    RequiredModules,
    OptionalModules
  >,
  MergedConfig extends Config = MergeConfig<Config, RequiredModules, OptionalModules>,
  NewConfig extends AnyModuleConfig = ModuleConfig<
    Config,
    MergedConfig,
    getConfigImplementation<Config>,
    getConfigImplementation<MergedConfig>
  >,
  OutsideInterface extends ModuleOutsideInterface<MergedInterface> = getOutSideInterface<MergedInterface, MergedConfig>,
  MergedImplement = getImplementation<OutsideInterface, OutsideInterface>,
  /** @ts-expect-error - Not gonna define this better since this should not be defined manually. */
  Implementation extends SubsetKeys<OutsideInterface, Implementation> = getImplementation<OutsideInterface, Definition>,
  NewContext = ModuleContext<Definition, MergedInterface, OutsideInterface, Implementation, MergedImplement>,
> = Module<Name, Definition, NewConfig, NewContext, RequiredModules, OptionalModules>;

export type newModuleName<T> = T;
export type moduleNameToString<T> = T;
// Module Config types

export type ModuleConfigValue<T> = Record<keyof T, Exclude<any, Function>>;
export type AnyModuleConfig = ModuleConfig<any, any, any, any>;
export type ModuleConfig<
  Config extends ModuleConfigValue<Config>,
  MergedConfig extends Config = Config,
  Implement = Config,
  MergedImplement = Config,
> = {
  Merged: MergedConfig;
  MergedImplement: MergedImplement;
  Incoming: Config;
  Implement: Implement;
};
export type ModuleContextInterface<T> = Record<keyof T, any>;
export type ModuleOutsideInterface<ContextInterface extends ModuleContextInterface<ContextInterface>> = Record<
  keyof ContextInterface,
  any
>;

// Context types

export type ModuleContext<
  Incoming,
  ContextInterface extends ModuleContextInterface<ContextInterface> = Incoming,
  OutsideInterface extends ModuleOutsideInterface<ContextInterface> = ContextInterface,
  Implement extends SubsetKeys<ContextInterface, Implement> = ContextInterface,
  MergedImplement = OutsideInterface,
> = {
  Incoming: Incoming;
  ContextInterface: ContextInterface;
  OutsideInterface: OutsideInterface;
  Implement: Implement;
  MergedImplement: MergedImplement;
};

// Module types

export type ModuleName = string;
export type AnyModule = Module<any, any, any, any, any, any>;

/**
 * Core Module type definition, composed of the module's name, config, context and definition.
 * Also includes optional and required dependencies on other modules.
 */
export type Module<
  Name extends ModuleName,
  Definition,
  Config extends AnyModuleConfig,
  Context,
  RequiredModules extends AnyModule[] = [],
  OptionalModules extends AnyModule[] = [],
> = {
  ModuleName: Name;
  Config: Config;
  Context: Context;
  Definition: Definition;
  RequiredModules: RequiredModules;
  OptionalModules: OptionalModules;
};

type FunctionKeys<T> = {
  [K in keyof T]: string extends K ? never : T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type NonFunctionKeys<T> = {
  [K in keyof T]: string extends K ? never : T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

type ReplaceFunctionKeys<T, Context, Config> = {
  [K in FunctionKeys<T>]: T[K] extends (...args: any[]) => any
    ? changeFunctionToPipes<addParameters<T[K], Context, Config>>
    : never;
} & {
  [K in NonFunctionKeys<T>]: T[K] extends (...args: any[]) => any ? never : T[K];
};

type ReplaceImplementation<T> = {
  [K in NonFunctionKeys<T>]: string extends K
    ? never
    : T[K] extends (...args: any[]) => any
    ? never
    : valueToZod<T[K]> | T[K];
} & {
  [K in FunctionKeys<T>]: string extends K ? never : T[K] extends (...args: any[]) => any ? T[K] : never;
};

type ReplaceConfigImplementation<T> = {
  [K in NonFunctionKeys<T>]: T[K] extends (...args: any[]) => any ? never : valueToZod<T[K]> | T[K];
} & {
  [K in FunctionKeys<T>]: T[K] extends (...args: any[]) => any ? never : never;
};

export type getConfigImplementation<T> = Simplify<withoutNever<ReplaceConfigImplementation<T>>>;

type getOutSideInterface<T extends ModuleContextInterface<T>, Config> = ReplaceFunctionKeys<
  T,
  T,
  Config
> extends ModuleOutsideInterface<T>
  ? ReplaceFunctionKeys<T, T, Config>
  : never;

export type getImplementation<T extends ModuleContextInterface<T>, K extends SubsetKeys<T, K>> = withoutNever<
  ReplaceImplementation<SubsetKeys<T, K>>
>;
export type getContextImplementation<T> = ReplaceImplementation<T>;

// Merge Helper types

/**
 * Utility type to merge states based on a specific string key.
 * Handles the case of both correct and incorrect keys.
 */
export type MergeStateHelper<
  Definition extends string,
  NewState,
  PrevModules extends AnyModule[] = [],
  PossibleModules extends AnyModule[] = [],
> = Definition extends isNestedKey<AnyModule, Definition>
  ? // Correct key. Merge.
    Simplify<
      // Merge all modules.
      unionToIntersection<
        NewState &
          withoutNever<
            // Possible modules. Add partial. Remove keys that are already in prev modules.
            ifIsNotZero<
              PossibleModules["length"],
              ifIsNotZero<
                PrevModules["length"],
                Omit<
                  Partial<getNestedObject<PossibleModules[number], Definition>>,
                  keyof getNestedObject<PrevModules[number], Definition>
                >,
                Partial<getNestedObject<PossibleModules[number], Definition>>
              >,
              NewState
            > &
              // Required modules.
              ifIsNotZero<PrevModules["length"], getNestedObject<PrevModules[number], Definition>, NewState>
          >
      >
    >
  : // Wrong key! Return never
    never;

export type MergeOutsideInterface<
  NewState,
  PrevModules extends AnyModule[] = [],
  PossibleModules extends AnyModule[] = [],
  MergedState = MergeStateHelper<"Definition", NewState, PrevModules, PossibleModules>,
> = MergedState extends ModuleOutsideInterface<NewState> ? MergedState : never;

export type MergeConfig<
  NewState extends Record<string, any>,
  PrevModules extends AnyModule[] = [],
  PossibleModules extends AnyModule[] = [],
  MergedState = MergeStateHelper<"Config.Incoming", NewState, PrevModules, PossibleModules>,
> = MergedState extends NewState ? MergedState : never;

export type MergeModules<
  PrevModules extends AnyModule[] = [],
  MergedConfig = PrevModules extends [infer X, ...infer R]
    ? X extends AnyModule
      ? R extends AnyModule[]
        ? MergeStateHelper<"Config.Incoming", X["Config"]["Incoming"], R, []>
        : never
      : never
    : PrevModules extends [infer X]
    ? X extends AnyModule
      ? MergeStateHelper<"Config.Incoming", X["Config"]["Incoming"], [], []>
      : never
    : never,
  MergedContext = PrevModules extends [infer X, ...infer R]
    ? X extends AnyModule
      ? R extends AnyModule[]
        ? MergeStateHelper<"Context.Incoming", X["Context"]["Incoming"], R, []>
        : never
      : never
    : PrevModules extends [infer X]
    ? X extends AnyModule
      ? MergeStateHelper<"Context.Incoming", X["Context"]["Incoming"], [], []>
      : never
    : never,
  Name extends newModuleName<"CurrentState"> = newModuleName<"CurrentState">,
> = CreateModule<Name, MergedContext, MergedConfig>;

/**
 * Type function to merge multiple modules into one.
 * This type focuses solely on merging the modules' content without the intricate details.
 */
export type MMergeModules<
  ModulesToMerge extends AnyModule[],
  Name extends ModuleName = newModuleName<"CurrentState">,
> = CreateModule<Name, EmptyObject, {}, ModulesToMerge>;
