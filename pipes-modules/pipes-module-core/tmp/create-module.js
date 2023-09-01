/**
 * @file Create Pipes Context Module
 */ import { z } from "@islandis/zod";
import { createPipesContextCommand } from "./create-pipes-context-command.js";
export const createModuleName = (name)=>name;
export const createConfig = (fn)=>fn;
export const createContext = (fn)=>fn;
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
        required,
        optional
    };
};
export const createModule = (param)=>_createModule(param);
