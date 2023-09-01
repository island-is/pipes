/**
 * @file Create functions for context commands.
 */ import { z } from "@island.is/zod";
export const createPipesContextCommand = ({ value = undefined, output = z.void(), implement })=>{
    // Skip validating context and config
    const configSchema = z.custom();
    const contextSchema = z.custom();
    const _fn = (__fn)=>{
        if (value === undefined) {
            return z.function().args(contextSchema.describe("Context"), configSchema.describe("Config")).returns(output).implement(__fn);
        }
        return z.function().args(contextSchema.describe("Context"), configSchema.describe("Config"), value).returns(output).implement(__fn);
    };
    const __fn = _fn(implement);
    const fn = (...args)=>{
        // We will add debug and stuff later.
        return fn._fn(...args);
    };
    const wrapper = (newFn)=>_fn(newFn);
    fn._wrapper = wrapper;
    fn._implement = _fn;
    fn._fn = __fn;
    fn._isPipesCommand = true;
    return fn;
};
