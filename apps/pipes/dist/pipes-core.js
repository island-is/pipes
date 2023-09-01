import { Container, Client, connect } from '@dagger.io/dagger';
export * from '@dagger.io/dagger';
import { parseArgs } from 'node:util';
import { ZodType, z } from 'zod';
export { z } from 'zod';
import { autorun, createAtom } from 'mobx';
import ciinfo from 'ci-info';

class AtomMap {
    #atom = new Map();
    get(key) {
        if (!this.#atom.has(key)) {
            const value = createAtom(key);
            this.#atom.set(key, value);
            return value;
        }
        return this.#atom.get(key);
    }
}
const createAtomMap = ()=>new AtomMap();
function createZodStore(obj, skip = []) {
    return new class {
        /** @ts-expect-error: this is accessed */ #values = {};
        constructor(){
            const observables = createAtomMap();
            const skipped = skip.map(({ key })=>key);
            for (const { key, get, set } of skip){
                // So we can get all keys with Object.keys
                this[key] = undefined;
                Object.defineProperty(this, key, {
                    get,
                    set: set ?? undefined
                });
            }
            for (const key of Object.keys(obj)){
                if (skipped.includes(key)) {
                    continue;
                }
                // So we can get all keys with Object.keys
                this[key] = true;
                Object.defineProperty(this, key, {
                    get: ()=>{
                        observables.get(key).reportObserved();
                        if (typeof this.#values[key] === "undefined") {
                            if (typeof obj[key] === "function") {
                                this.#values[key] = obj[key];
                            } else {
                                this.#values[key] = obj[key].parse(undefined);
                            }
                        }
                        return this.#values[key];
                    },
                    set: (value)=>{
                        if (typeof obj[key] === "function") {
                            observables.get(key).reportChanged();
                            this.#values[key] = obj[key]._wrapper(value);
                            return true;
                        }
                        this.#values[key] = obj[key].parse(value);
                        observables.get(key).reportChanged();
                        return true;
                    }
                });
            }
        }
    }();
}
const wrapContext = (obj, config, stack = [
    config.appName
])=>{
    const functionParams = Object.entries(obj).filter(([_key, value])=>typeof value === "function");
    const skip = [
        {
            key: "stack",
            get: ()=>stack
        },
        ...functionParams.map(([key, value])=>{
            return {
                key,
                get: ()=>{
                    return (val)=>{
                        const newContext = wrapContext(obj, config, [
                            ...stack,
                            key
                        ]);
                        return value(newContext, config, val);
                    };
                }
            };
        })
    ];
    return new class {
        /** @ts-expect-error: this is accessed */ #values = {};
        constructor(){
            const skipped = skip.map(({ key })=>key);
            for (const { key, get } of skip){
                // So we can get all keys with Object.keys
                this[key] = undefined;
                Object.defineProperty(this, key, {
                    get
                });
            }
            for (const key of Object.keys(obj)){
                if (skipped.includes(key)) {
                    continue;
                }
                // So we can get all keys with Object.keys
                this[key] = true;
                Object.defineProperty(this, key, {
                    get: ()=>{
                        return obj[key];
                    },
                    set: (value)=>{
                        obj[key] = value;
                        return true;
                    }
                });
            }
        }
    }();
};
const createLockStore = ()=>{
    return new class {
        #atom = createAtomMap();
        #map = new Map();
        #lockKey = (key)=>{
            this.#map.set(key, true);
            this.#atom.get(key).reportChanged();
        };
        #unlock = (key)=>{
            this.#map.set(key, false);
            this.#atom.get(key).reportChanged();
        };
        isLocked(key) {
            this.#atom.get(key).reportObserved();
            return this.#map.has(key) ? this.#map.get(key) === true : false;
        }
        waitForLock(key) {
            return new Promise((resolve)=>{
                const fn = {};
                fn.stopWait = autorun(()=>{
                    this.#atom.get(key).reportObserved();
                    const isLocked = this.isLocked(key);
                    if (!isLocked) {
                        resolve();
                        if (!fn.stopWait) {
                            return;
                        }
                        fn.stopWait();
                    }
                });
            });
        }
        async lock(key, fn) {
            await this.waitForLock(key);
            this.#lockKey(key);
            let value;
            try {
                value = await fn();
            } catch (e) {
                this.#unlock(key);
                throw e;
            }
            this.#unlock(key);
            return value;
        }
    }();
};
const createZodKeyStore = (type)=>{
    return new class {
        #type;
        #atom = createAtomMap();
        #map = new Map();
        #lock = createLockStore();
        constructor(){
            this.#type = type;
        }
        awaitForAvailability(key) {
            return new Promise((resolve)=>{
                const fn = {};
                fn.stopWaiting = autorun(async ()=>{
                    this.#atom.get(key).reportObserved();
                    const value = await this.getKey(key);
                    if (value !== null) {
                        resolve(value);
                        if (!fn.stopWaiting) {
                            return;
                        }
                        fn.stopWaiting();
                    }
                });
            });
        }
        async getKey(key) {
            const value = await this.#lock.lock(key, ()=>{
                this.#atom.get(key).reportObserved();
                return !this.#map.has(key) ? null : this.#map.get(key);
            });
            return value;
        }
        async setKey(key, value) {
            await this.#lock.lock(key, ()=>{
                this.#map.set(key, this.#type.parse(value));
                this.#atom.get(key).reportChanged();
            });
        }
        async getOrSet(key, fn) {
            const value = await this.#lock.lock(key, async ()=>{
                if (!this.#map.has(key)) {
                    const newValue = await fn();
                    this.#atom.get(key).reportChanged();
                    this.#map.set(key, newValue);
                    return newValue;
                }
                this.#atom.get(key).reportObserved();
                return this.#map.get(key);
            });
            return value;
        }
    }();
};
const globalstore = {};
const globalLock = createLockStore();
const createGlobalZodKeyStore = (obj, key)=>{
    return globalLock.lock(key, ()=>{
        if (globalstore[key]) {
            return globalstore[key];
        }
        globalstore[key] = createZodKeyStore(obj);
        return globalstore[key];
    });
};

const getMostInnerZodType = (schema, prev = null)=>{
    // Check if the current schema has an innerType
    if (schema instanceof z.ZodString) {
        return "string";
    }
    if (schema instanceof z.ZodNumber) {
        return "number";
    }
    if (schema instanceof z.ZodBoolean) {
        return "boolean";
    }
    if (schema instanceof z.ZodLiteral) {
        return "literal";
    }
    if (schema instanceof z.ZodArray) {
        return `array:${getMostInnerZodType(schema._def.type, "array")}`;
    }
    if (schema instanceof z.ZodUnion) {
        return `union:literal`;
    }
    const inner = schema._def?.innerType;
    if (inner) {
        return getMostInnerZodType(inner);
    }
    throw new Error("Not implemented yet for env");
};
const oldDefault = ZodType.prototype.default;
const getArgv = (context, options)=>{
    if (options === undefined || // Arg overwrites env
    options.arg === undefined) {
        return null;
    }
    const fn = oldDefault.bind(context);
    const zodType = getMostInnerZodType(context);
    const argOptions = {
        type: zodType === "boolean" || zodType === "array:boolean" ? "boolean" : "string",
        multiple: zodType.startsWith("array:")
    };
    if (options.arg.short !== undefined) {
        argOptions.short = options.arg.short;
    }
    const { values, positionals } = parseArgs({
        args: process.argv.slice(2),
        options: {
            [options.arg.long]: argOptions
        },
        allowPositionals: true,
        strict: false
    });
    const value = (()=>{
        if (options.arg?.positional && positionals.length !== 0) {
            return positionals;
        }
        return values[options.arg.long];
    })();
    if (value != undefined) {
        switch(zodType){
            case "string":
            case "literal":
            case `union:literal`:
                if (Array.isArray(value)) {
                    return fn(value[0]);
                }
                return fn(value);
            case "number":
                if (Array.isArray(value)) {
                    return fn(Number(value[0]));
                }
                return fn(Number(value));
            case "boolean":
                if (Array.isArray(value)) {
                    return fn(value[0]);
                }
                return fn(value);
            case `array:string`:
            case `array:literal`:
                if (Array.isArray(value)) {
                    return fn(value);
                }
                if (typeof value === "string") {
                    return fn(value.split(","));
                }
                return fn(undefined);
            case `array:number`:
                if (Array.isArray(value) && value.every((v)=>!Number.isNaN(Number(v)))) {
                    return fn(value.map(Number));
                }
                if (typeof value === "string") {
                    return fn(value.split(",").map(Number));
                }
                return fn(undefined);
            case `array:boolean`:
                return fn(value);
            default:
                throw new Error(`Not implemented yet for this type ${zodType}`);
        }
    }
    return null;
};
const getEnv = (context, options)=>{
    if (options === undefined || options.env === undefined) {
        return null;
    }
    const fn = oldDefault.bind(context);
    const value = process.env[options.env];
    if (value !== undefined) {
        const zodType = getMostInnerZodType(context);
        switch(zodType){
            case "string":
            case `union:literal`:
            case "literal":
                return fn(value);
            case "number":
                return fn(Number(value));
            case "boolean":
                return fn(value === "true");
            case `array:string`:
                return fn(value.split(","));
            case `array:number`:
                return fn(value.split(",").map(Number));
            case `array:boolean`:
                return fn(value.split(",").map((v)=>v === "true"));
            default:
                throw new Error(`Not implemented yet for this type ${zodType}`);
        }
    }
    return null;
};
/** @ts-expect-error - Patching */ ZodType.prototype.default = function(def, options) {
    const fn = oldDefault.bind(this);
    return getArgv(this, options) || getEnv(this, options) || fn(def);
};

const createPipesContextCommand = ({ value = undefined, output = z.void(), implement })=>{
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

function createModuleName(name) {
    return name;
}
function createConfig(fn) {
    return fn;
}
function createContext(fn) {
    return fn;
}
const _createModule = ({ name, config, context, required = [], optional = [] })=>{
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
function createModule(param) {
    return _createModule(param);
}

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
const PipesCore = createModule({
    name: "PipesCore",
    config: PipesCoreConfig,
    context: PipesCoreContext
});

/**
 * Represents the core class for contexts and modules.
 * @class
 */ class PipesCoreClass {
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
 */ const createPipesCore = ()=>{
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
 */ const ContextHasModule = (context, key)=>{
    return !!(context && typeof context === "object" && key in context);
};
/**
 * Type guard that checks if config has module
 */ const ConfigHasModule = (config, key)=>{
    return !!(config && typeof config === "object" && key in config);
};

class PipesCoreRunner {
    #context = new Set();
    addContext(value) {
        this.#context.add(value);
        return ()=>{
            this.removeContext(value);
        };
    }
    removeContext(value) {
        this.#context.delete(value);
    }
    async run() {
        await connect(async (client)=>{
            const _haltObj = {};
            const halt = ()=>{
                if (_haltObj.halt) {
                    void _haltObj.halt("Forced quit");
                } else {
                    process.exit(1);
                }
            };
            const fakePromise = new Promise((_resolve, reject)=>{
                _haltObj.halt = reject;
            });
            for (const context of this.#context){
                context.client = client;
                context.haltAll = halt;
            }
            const contextPromises = await Promise.all(Array.from(this.#context).map(async (value)=>{
                await value.run();
            }));
            await Promise.race([
                fakePromise,
                contextPromises
            ]);
        }, {
            LogOutput: process.stdout
        });
    }
}
const createPipe = async (// eslint-disable-next-line no-shadow
fn)=>{
    const core = new PipesCoreRunner();
    const values = await fn({
        z,
        createPipesCore,
        createConfig,
        createContext,
        createModule,
        contextHasModule: ContextHasModule,
        configHasModule: ConfigHasModule
    });
    for (const value of values){
        // If we define this better we get circular errors…
        core.addContext(value);
    }
    await core.run();
};

export { PipesCoreRunner, createConfig, createContext, createGlobalZodKeyStore, createModule, createPipe, createZodStore, wrapContext };
//# sourceMappingURL=pipes-core.js.map
