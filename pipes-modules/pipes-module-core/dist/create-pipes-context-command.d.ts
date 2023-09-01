import type { Module, ModuleConfig, ModuleConfigValue, ModuleContext, ModuleContextInterface } from "./types/module.js";
import type { PipesContextCommand } from "./types/pipes-command.js";
import type { valueToZod } from "./types/value-to-zod.js";
export declare const createPipesContextCommand: <BaseModule extends Module<any, any, any, any, any, any>, Value = undefined, Output = undefined, _BaseContext extends ModuleContext<any, any, any> = BaseModule["Context"], BaseContext extends ModuleContextInterface<BaseContext> = _BaseContext["ContextInterface"], _BaseConfig extends ModuleConfig<any, any, any> = BaseModule["Config"], BaseConfig extends ModuleConfigValue<BaseConfig> = _BaseConfig["Merged"], ValueSchema extends valueToZod<Value> | undefined = undefined extends Value ? undefined : valueToZod<Value>, OutputSchema extends valueToZod<Output> = valueToZod<Output>>({ value, output, implement, }: {
    value?: ValueSchema | undefined;
    output?: OutputSchema | undefined;
    implement: (context: BaseContext, config: BaseConfig, _value: Value) => Output;
}) => PipesContextCommand<BaseModule, Value, Output>;
