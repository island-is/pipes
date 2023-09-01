/**
 * @file Create functions for context commands.
 */

import { z } from "@island.is/zod";

import type { Module, ModuleConfig, ModuleConfigValue, ModuleContext, ModuleContextInterface } from "./types/module.js";
import type { PipesContextCommand } from "./types/pipes-command.js";
import type { valueToZod } from "./types/value-to-zod.js";

export const createPipesContextCommand = <
  BaseModule extends Module<any, any, any, any, any, any>,
  Value = undefined,
  Output = undefined,
  _BaseContext extends ModuleContext<any, any, any> = BaseModule["Context"],
  BaseContext extends ModuleContextInterface<BaseContext> = _BaseContext["ContextInterface"],
  _BaseConfig extends ModuleConfig<any, any, any> = BaseModule["Config"],
  BaseConfig extends ModuleConfigValue<BaseConfig> = _BaseConfig["Merged"],
  ValueSchema extends valueToZod<Value> | undefined = undefined extends Value ? undefined : valueToZod<Value>,
  OutputSchema extends valueToZod<Output> = valueToZod<Output>,
>({
  value = undefined as any,
  output = z.void() as any,
  implement,
}: {
  value?: ValueSchema;
  output?: OutputSchema;
  implement: (context: BaseContext, config: BaseConfig, _value: Value) => Output;
}): PipesContextCommand<BaseModule, Value, Output> => {
  // Skip validating context and config
  const configSchema = z.custom<BaseConfig>();
  const contextSchema = z.custom<BaseContext>();
  const _fn = (__fn: typeof implement) => {
    if (value === undefined) {
      return z
        .function()
        .args(contextSchema.describe("Context"), configSchema.describe("Config"))
        .returns(output)
        .implement(__fn as any);
    }
    return z
      .function()
      .args(contextSchema.describe("Context"), configSchema.describe("Config"), value)
      .returns(output)
      .implement(__fn as any);
  };
  const __fn = _fn(implement);
  const fn: ReturnType<typeof __fn> = (...args: Parameters<typeof __fn>) => {
    // We will add debug and stuff later.
    return fn._fn(...args);
  };
  const wrapper: ReturnType<typeof __fn> = (newFn: typeof implement) => _fn(newFn);
  (fn as unknown as PipesContextCommand<BaseModule, Value, Output>)._wrapper = wrapper;
  (fn as unknown as PipesContextCommand<BaseModule, Value, Output>)._implement = _fn;
  (fn as unknown as PipesContextCommand<BaseModule, Value, Output>)._fn = __fn;
  (fn as unknown as PipesContextCommand<BaseModule, Value, Output>)._isPipesCommand = true;
  return fn as unknown as PipesContextCommand<BaseModule, Value, Output>;
};
