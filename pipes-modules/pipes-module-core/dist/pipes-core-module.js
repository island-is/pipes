/* eslint-disable no-shadow */ /**
 * @file Core module for pipes
 */ import { Client, Container } from "@dagger.io/dagger";
import { createGlobalZodKeyStore } from "@island.is/zod";
import ciinfo from "ci-info";
// eslint-disable-next-line sort-imports
import { createConfig, createContext, createModule as _createModule } from "./create-module.js";
const PipesCoreConfig = createConfig(({ z })=>({
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
        isCI: z.boolean().default(ciinfo.isCI, {
            env: "ci",
            arg: {
                long: "isCI",
                short: "c"
            }
        }).describe("Is the current environment a CI environment"),
        isPR: z.boolean().default(ciinfo.isPR || false).describe("Is the current environment a PR environment")
    }));
const PipesCoreContext = createContext(({ z, fn })=>({
        haltAll: fn({
            implement: ()=>{}
        }),
        addEnv: fn({
            output: z.custom(),
            value: z.object({
                container: z.custom(),
                env: z.array(z.tuple([
                    z.string(),
                    z.string()
                ]))
            }),
            implement: (_context, _config, { container, env })=>{
                let newContainer = container;
                for (const [key, value] of env){
                    newContainer = newContainer.withEnvVariable(key, value);
                }
                return newContainer;
            }
        }),
        modules: z.array(z.string()).default([]).describe("The modules to load"),
        stack: z.array(z.string()).default([]).describe("The caller stack"),
        imageStore: z.custom(()=>{
            return createGlobalZodKeyStore(z.custom((val)=>{
                if (val instanceof Container) {
                    return val;
                }
                throw new Error("Invalid value");
            }), "PIPES-IMAGE-STORE");
        }),
        client: z.custom((val)=>{
            if (val instanceof Client) {
                return val;
            }
            throw new Error("Provided client is not an instance of the expected Client class.");
        }),
        hasModule: fn({
            output: z.boolean(),
            value: z.string(),
            implement: (context, _config, value)=>{
                return context.modules.includes(value);
            }
        })
    }));
export const PipesCore = _createModule({
    name: "PipesCore",
    config: PipesCoreConfig,
    context: PipesCoreContext
});
