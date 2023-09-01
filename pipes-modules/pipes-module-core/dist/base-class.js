import { Client, Container } from "@dagger.io/dagger";
import { createGlobalZodKeyStore, createZodStore, wrapContext, z } from "@island.is/zod";
import { PipesCore } from "./pipes-core-module.js";
/**
 * Represents the core class for contexts and modules.
 * @class
 */ export class PipesCoreClass {
    /**
   * A private array to store scripts.
   * @private
   */ #scripts = [];
    /**
   * Adds a new script to the core.
   */ addScript(fn) {
        this.#scripts.push(fn);
        return this;
    }
    #haltAll = ()=>{};
    set haltAll(value) {
        this.#haltAll = value;
    }
    get haltAll() {
        return this.#haltAll;
    }
    /**
   * Private state management related to the readiness and modules of the core.
   */ #internalStatesStore = {
        modules: [
            "PipesCoreModule"
        ],
        isReady: {
            state: "NOT_READY",
            reason: "Dagger Client has not been injected"
        }
    };
    #internalStates = new Proxy(this.#internalStatesStore, {
        set: (target, prop, value)=>{
            if (prop === "client") {
                if (value && value instanceof Client) {
                    target.client = value;
                    target.isReady.state = "READY";
                    delete target.isReady.reason;
                    return true;
                } else {
                    delete target.client;
                    target.isReady.state = "NOT_READY";
                    target.isReady.reason = "Dagger Client has not been injected";
                }
                return true;
            }
            return false;
        }
    });
    // Private Zod schemas to parse configurations and contexts.
    #configSchema;
    #contextSchema;
    // Public instances for config and context.
    config;
    context;
    constructor({ modules, schemas: { config, context } }){
        this.#internalStatesStore.modules = modules;
        this.#configSchema = config;
        this.#contextSchema = context;
        this.config = createZodStore(this.#configSchema);
        this.context = createZodStore(this.#contextSchema, [
            {
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ key: "imageStore",
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ get: ()=>{
                    return createGlobalZodKeyStore(z.custom((val)=>{
                        if (val instanceof Container) {
                            return val;
                        }
                        throw new Error("Invalid value");
                    }), "PIPES-IMAGE-STORE");
                }
            },
            {
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ key: "haltAll",
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ get: ()=>{
                    return this.haltAll;
                }
            },
            {
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ key: "client",
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ get: ()=>{
                    return this.client;
                }
            },
            {
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ key: "modules",
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ get: ()=>{
                    return this.modules;
                }
            }
        ]);
    }
    // Public getter to check if the core is ready.
    get isReady() {
        return this.#internalStates.isReady.state === "READY";
    }
    // Public getter to fetch the current modules.
    get modules() {
        return this.#internalStates.modules;
    }
    /**
   * Method to check if a specific module is present.
   */ hasModule(moduleName) {
        return this.modules.includes(moduleName);
    }
    /**
   * Method to add a new module to the core.
   */ addModule(module) {
        if (this.isReady) {
            throw new Error(`Cannot add module when in ready state`);
        }
        const requiredModules = module.required ?? [];
        for (const requiredModule of requiredModules){
            if (!this.hasModule(requiredModule)) {
                throw new Error(`Missing required module ${requiredModule}`);
            }
        }
        const newConfigSchema = {
            ...this.#configSchema,
            ...module.config
        };
        const newContextSchema = {
            ...this.#contextSchema,
            ...module.context
        };
        const modules = [
            ...this.modules,
            module.name
        ];
        return new PipesCoreClass({
            modules,
            schemas: {
                config: newConfigSchema,
                context: newContextSchema
            }
        });
    }
    // Setter/getter for client
    set client(client) {
        this.#internalStates.client = client;
    }
    get client() {
        if (!this.isReady) {
            throw new Error("Client not ready");
        }
        return this.#internalStates.client;
    }
    // Method to run all the scripts stored in the core.
    async run() {
        if (this.#internalStates.isReady.state === "NOT_READY") {
            throw new Error(this.#internalStates.isReady.reason);
        }
        const context = wrapContext(this.context, this.config);
        await Promise.all(this.#scripts.map(async (fn)=>{
            const value = await fn(context, this.config);
            return value;
        }));
    }
}
/**
 * Factory function to create a new instance of the `PipesCoreClass`.
 */ export const createPipesCore = ()=>{
    const core = new PipesCoreClass({
        modules: [
            PipesCore.name
        ],
        schemas: {
            config: PipesCore.config,
            context: PipesCore.context
        }
    });
    return core;
};
/**
 * Type guard that checks if context has module
 */ export const ContextHasModule = (context, key)=>{
    return !!(context && typeof context === "object" && key in context);
};
/**
 * Type guard that checks if config has module
 */ export const ConfigHasModule = (config, key)=>{
    return !!(config && typeof config === "object" && key in config);
};
