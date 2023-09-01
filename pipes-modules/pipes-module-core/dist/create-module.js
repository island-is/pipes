/**
 * @file Create Pipes Context Module
 */ import { z } from "@island.is/zod";
import { createPipesContextCommand } from "./create-pipes-context-command.js";
export function createModuleName(name) {
    return name;
}
export function createConfig(fn) {
    return fn;
}
export function createContext(fn) {
    return fn;
}
export const _createModule = ({ name, config, context, required = [], optional = [] })=>{
    const fn = (props)=>createPipesContextCommand(props);
    return {
        name,
        config: config({
            z
        }),
        context: context({
            z,
            fn
        }),
        required: required.map((e)=>createModuleName(e)),
        optional: optional.map((e)=>createModuleName(e))
    };
};
// NOTICE: We reintroduce alot of typing here so modules can be safely isolated.
export function createModule(param) {
    return _createModule(param);
}
