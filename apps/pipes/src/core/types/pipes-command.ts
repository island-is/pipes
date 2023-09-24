import type { ExtendType } from "./extend-type.js";
import type { AnyModule } from "./module.js";

const PipesContextCommandSymbol = Symbol("PipesContextCommand");
export type PipesContextCommandImplementation<
  Context extends Record<string, any>,
  Config extends Record<string, any>,
  Value,
  Output,
> = Value extends undefined
  ? (context: ExtendType<Context>, config: ExtendType<Config>) => Output
  : (context: ExtendType<Context>, config: ExtendType<Config>, value: Value) => Output;

/** These are internal usage only and not typesafe. */
export type PipesContextCommandBase = {
  _isPipesCommand: true;
  _fn: any;
  _wrapper: (fn: any) => any;
  _implement: any;
  [PipesContextCommandSymbol]?: never;
};

export type PipesContextCommand<Module extends AnyModule, Value, Output> = PipesContextCommandBase &
  PipesContextCommandImplementation<Module["Context"]["ContextInterface"], Module["Config"]["Merged"], Value, Output>;

export const isPipesContextCommand = (val: unknown): val is PipesContextCommand<any, any, any> =>
  typeof val === "function" && (val as PipesContextCommand<any, any, any>)._isPipesCommand === true;
