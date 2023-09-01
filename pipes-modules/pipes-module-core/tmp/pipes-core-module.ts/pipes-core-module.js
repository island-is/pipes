/**
 * @file Core module for pipes
 */ import ciinfo from "ci-info";
import { createConfig, createContext, createModule } from "./create-module.js";
const Client = (await import("@dagger.io/dagger")).default;
const PipeCoreConfig = createConfig(({ z })=>({
        appName: z.string().default("pipes").describe("The name of the context"),
        env: z.union([
            z.literal("github"),
            z.literal("gitlab"),
            z.literal("local")
        ]).default(()=>{
            if (ciinfo.GITLAB) {
                return "gitlab";
            }
            if (ciinfo.GITHUB_ACTIONS) {
                return "github";
            }
            return "local";
        }).describe("The environment the code is running in"),
        isCI: z.boolean().default(ciinfo.isCI).describe("Is the current environment a CI environment"),
        isPR: z.boolean().default(ciinfo.isPR || false).describe("Is the current environment a PR environment")
    }));
const PiperCoreContext = createContext(({ z, fn })=>({
        modules: z.array(z.custom()).describe("The modules to load"),
        client: z.custom((val)=>{
            if (val instanceof Client) {
                return val;
            }
            throw new Error("Invalid client");
        }),
        hasModule: fn({
            output: z.boolean(),
            value: z.string(),
            implement: (context, _config, value)=>{
                return context.modules.includes(value);
            }
        }),
        contextHasModule: fn({
            output: z.boolean(),
            value: z.custom(),
            implement: (context, _config, value)=>{
                return context.hasModule(value);
            }
        }),
        configHasModule: fn({
            output: z.boolean(),
            value: z.custom(),
            implement: (context, _config, value)=>{
                return context.hasModule(value);
            }
        })
    }));
export const PipesCore = createModule({
    name: "PipesCore",
    config: PipeCoreConfig,
    context: PiperCoreContext
});
