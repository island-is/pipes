import { Client, Container } from "@dagger.io/dagger";
import { when } from "mobx";

import { createGlobalZodKeyStore, createZodStore, wrapContext, z } from "../utils/zod/zod.js";

import { createInternalState, createState } from "./internal-schema.js";
import { PipesCore, type PipesCoreModule } from "./pipes-core-module.js";
import { throwJSXError } from "./throw-jsx-error.js";

import type { InternalStateStore, LoaderStateStore } from "./types/internal-schema-types.js";
import type { AnyModule, MergeModules, ModuleName } from "./types/module.js";
import type { PipesContextCommandBase } from "./types/pipes-command.js";
import type { Simplify } from "./types/simplify.js";

/**
 * Represents the core class for contexts and modules.
 * @class
 */
export class PipesCoreClass<
  Modules extends AnyModule[] = [PipesCoreModule],
  CurrentState extends MergeModules<Modules> = MergeModules<Modules>,
  CurrentConfig extends CurrentState["Config"] = CurrentState["Config"],
  CurrentContext extends CurrentState["Context"] = CurrentState["Context"],
  ScriptFn extends fn<CurrentContext["ContextInterface"], CurrentConfig["Merged"]> = fn<
    CurrentContext["ContextInterface"],
    CurrentConfig["Merged"]
  >,
> {
  /**
   * A private array to store scripts.
   * @private
   */
  #scripts: ScriptFn[] = [];
  #symbol: symbol;
  get symbol(): symbol {
    return this.#symbol;
  }
  #dependencies = new Set<symbol>();
  addDependency(value: PipesCoreClass<any> | symbol): this {
    if (value instanceof PipesCoreClass) {
      this.#dependencies.add(value.symbol);
      return this;
    }
    this.#dependencies.add(value);
    return this;
  }
  removeDependency(value: PipesCoreClass<any> | symbol): this {
    if (value instanceof PipesCoreClass) {
      this.#dependencies.delete(value.symbol);
      return this;
    }
    this.#dependencies.add(value);
    return this;
  }
  /**
   * Adds a new script to the core.
   */
  addScript(fn: ScriptFn): this {
    const _fn = async (context: any, config: any) => {
      try {
        await fn(context, config);
      } catch (e) {
        throwJSXError(context, config, e, config.appName);
      }
    };
    this.#scripts.push(_fn as any);
    return this as any;
  }
  #haltAll: () => void = () => {};
  set haltAll(value: () => void | Promise<void>) {
    this.#haltAll = value;
  }
  get haltAll(): () => void {
    return this.#haltAll;
  }
  /**
   * Base core should inject this one.
   */
  addContext = (_context: unknown, _config: unknown, _props: { context: PipesCoreClass; debugName?: string }): void => {
    throw new Error("This should be overwritten");
  };
  /**
   * Private state management related to the readiness and modules of the core.
   */
  #internalStatesStore: State_Internal = {
    modules: ["PipesCoreModule" as ModuleName],
    isReady: {
      state: "NOT_READY",
      reason: "Dagger Client has not been injected",
    },
  };
  #internalStates = new Proxy(this.#internalStatesStore, {
    set: (target, prop: keyof State_Internal & "client", value) => {
      if (prop === "client") {
        if (value && value instanceof Client) {
          (target as any).client = value;
          target.isReady.state = "READY";
          delete (target.isReady as any).reason;
          return true;
        } else {
          delete (target as any).client;
          target.isReady.state = "NOT_READY";
          (target.isReady as any).reason = "Dagger Client has not been injected";
        }
        return true;
      }
      return false;
    },
  });

  // Private Zod schemas to parse configurations and contexts.
  #configSchema: CurrentState["Config"]["MergedImplement"];
  #contextSchema: CurrentState["Context"]["MergedImplement"];

  // Public instances for config and context.
  config: CurrentConfig["Merged"];
  context: {
    // Functions have WEIRD typing on purpose so they don't get easily overwritten
    // but we want them to be overwritten here, since the proxy handles it correctly.
    // eslint-disable-next-line max-len
    [key in keyof CurrentContext["OutsideInterface"]]: CurrentContext["OutsideInterface"][key] extends PipesContextCommandBase
      ? Diff<CurrentContext["OutsideInterface"][key], PipesContextCommandBase>
      : CurrentContext["OutsideInterface"][key];
  };

  constructor({
    modules,
    schemas: { config, context },
  }: {
    modules: ModuleName[];
    schemas: {
      config: CurrentConfig["MergedImplement"];
      context: CurrentContext["MergedImplement"];
    };
  }) {
    this.#internalStatesStore.modules = modules;
    this.#symbol = Symbol();
    this.#configSchema = config;
    this.#contextSchema = context;
    this.config = createZodStore<typeof config, CurrentConfig["Merged"]>(this.#configSchema);
    this.context = createZodStore<typeof context, CurrentContext["OutsideInterface"]>(this.#contextSchema, [
      {
        /** @ts-expect-error - For simplification this is not hardcoded into the generic. */
        key: "addContextToCore" as const,
        /** @ts-expect-error - For simplification this is not hardcoded into the generic. */
        get: () => {
          return this.addContext;
        },
      },
      {
        /** @ts-expect-error - For simplification this is not hardcoded into the generic. */
        key: "imageStore" as const,
        /** @ts-expect-error - For simplification this is not hardcoded into the generic. */
        get: () => {
          return createGlobalZodKeyStore(
            z.custom<Container>((val: unknown) => {
              if (val instanceof Container) {
                return val;
              }
              throwJSXError(this.context, this.config, "Incorrect container", "");
            }),
            "PIPES-IMAGE-STORE",
          );
        },
      },
      {
        /** @ts-expect-error - For simplification this is not hardcoded into the generic. */
        key: "haltAll" as const,
        /** @ts-expect-error - For simplification this is not hardcoded into the generic. */
        get: () => {
          try {
            return this.haltAll;
          } catch (e) {
            throwJSXError(this.context, this.config, e);
          }
        },
      },
      {
        /** @ts-expect-error - For simplification this is not hardcoded into the generic. */
        key: "client",
        /** @ts-expect-error - For simplification this is not hardcoded into the generic. */
        get: () => {
          try {
            return this.client;
          } catch (e) {
            throwJSXError(this.context, this.config, e);
          }
        },
      },
      {
        /** @ts-expect-error - For simplification this is not hardcoded into the generic. */
        key: "modules",
        /** @ts-expect-error - For simplification this is not hardcoded into the generic. */
        get: () => {
          try {
            return this.modules;
          } catch (e) {
            throwJSXError(this.context, this.config, e);
          }
        },
      },
    ]);
  }

  // Public getter to check if the core is ready.
  get isReady(): boolean {
    return this.#internalStates.isReady.state === "READY";
  }

  // Public getter to fetch the current modules.
  get modules(): ModuleName[] {
    return this.#internalStates.modules;
  }

  /**
   * Method to check if a specific module is present.
   */
  hasModule(moduleName: string): boolean {
    return this.modules.includes(moduleName);
  }

  /**
   * Method to add a new module to the core.
   */
  addModule<T extends AnyModule>(module: ModuleReturnType<T>): PipesCoreClass<[T, ...Modules]> {
    if (this.isReady) {
      throw new Error(`Cannot add module when in ready state`);
    }
    const requiredModules = module.required ?? [];
    for (const requiredModule of requiredModules) {
      if (!this.hasModule(requiredModule)) {
        throw new Error(`Missing required module ${requiredModule}`);
      }
    }
    const newConfigSchema = {
      ...this.#configSchema,
      ...module.config,
    };
    const newContextSchema = {
      ...this.#contextSchema,
      ...module.context,
    };
    const modules = [...this.modules, module.name];
    return new PipesCoreClass<[T, ...Modules]>({
      modules,
      schemas: { config: newConfigSchema, context: newContextSchema },
    });
  }

  // Setter/getter for client
  set client(client: Client) {
    (this.#internalStates as any).client = client;
  }
  get client(): Client {
    if (!this.isReady) {
      throw new Error("Client not ready");
    }
    return (this.#internalStates as any).client;
  }

  // Method to run all the scripts stored in the core.
  async run(
    state: LoaderStateStore = createState(),
    internalState: InternalStateStore = createInternalState(),
  ): Promise<void> {
    if (this.#internalStates.isReady.state === "NOT_READY") {
      throw new Error(this.#internalStates.isReady.reason);
    }
    internalState.name = (this.config as { appName: string }).appName;
    (this.context as { startTime: Date }).startTime = new Date();
    await when(() => {
      if (state.state !== "running") {
        return false;
      }

      if (state.state === "running") {
        const hasNotDep = Array.from(this.#dependencies).some((item) => !state.symbolsOfTasks.includes(item));
        if (hasNotDep) {
          return true;
        }
      }
      if (this.#dependencies.size === 0) {
        return true;
      }
      internalState.state = "waiting_for_dependency";
      for (const dep of this.#dependencies) {
        if (!state.symbolsOfTasksCompleted.includes(dep) && !state.symbolsOfTasksFailed.includes(dep)) {
          return false;
        }
      }
      return true;
    });
    const hasNot = Array.from(this.#dependencies).some((item) => !state.symbolsOfTasks.includes(item));
    if (hasNot) {
      internalState.state = "failed";
      throw new Error("A dependency was not included in runner");
    }
    const hasFailedDeps = !!state.symbolsOfTasksFailed.some((item) => this.#dependencies.has(item));
    if (hasFailedDeps) {
      internalState.state = "failed";
      throw new Error("A dependency has failed");
    }
    internalState.state = "running";
    const context = wrapContext<typeof this.context, CurrentContext["ContextInterface"]>(this.context, this.config);
    await Promise.all(
      this.#scripts.map(async (fn) => {
        const value = await fn(context, this.config);
        return value;
      }),
    ).catch((e) => {
      internalState.state = "failed";
      throw e;
    });
    internalState.state = "finished";
  }
}

/**
 * Factory function to create a new instance of the `PipesCoreClass`.
 */
export const createPipesCore = (): PipesCoreClass<[PipesCoreModule]> => {
  const core = new PipesCoreClass<[PipesCoreModule]>({
    modules: [PipesCore.name],
    schemas: {
      config: PipesCore.config,
      context: PipesCore.context,
    },
  });
  return core;
};

/**
 * Type guard that checks if context has module
 */
export const ContextHasModule = <T extends any, K extends keyof T, Context extends Partial<T>>(
  context: unknown,
  key: K,
): context is Simplify<Required<Pick<Context, keyof T>> & Omit<Context, keyof T>> => {
  return !!(context && typeof context === "object" && key in context);
};

/**
 * Type guard that checks if config has module
 */
export const ConfigHasModule = <T extends any, K extends keyof T, Config extends Partial<T>>(
  config: unknown,
  key: K,
): config is Simplify<Required<Pick<Config, keyof T>> & Omit<Config, keyof T>> => {
  return !!(config && typeof config === "object" && key in config);
};

// Helper types.
export type ModuleReturnType<NewModule extends AnyModule> = {
  name: NewModule["ModuleName"];
  config: NewModule["Config"]["Implement"];
  context: NewModule["Context"]["Implement"];
  required: NewModule["RequiredModules"][number]["ModuleName"] extends never
    ? []
    : NewModule["RequiredModules"][number]["ModuleName"][];
  optional: NewModule["OptionalModules"][number]["ModuleName"] extends never
    ? []
    : NewModule["OptionalModules"][number]["ModuleName"][];
};

type State_IsPipeCoreReady<T = any> = T extends {
  state: "READY" | "NOT_READY";
  reason?: string | undefined | null;
}
  ? T["state"] extends "READY"
    ? { state: "READY" }
    : { state: "NOT_READY"; reason: string }
  : never;
type State_Internal<T extends any = any> = T extends {
  client?: Client | undefined | null;
  isReady: State_IsPipeCoreReady;
  modules: ModuleName[];
}
  ? T["isReady"]["state"] extends "READY"
    ? { client: Client; modules: ModuleName[]; isReady: State_IsPipeCoreReady<{ state: "READY" }> }
    : T["isReady"]["state"] extends "NOT_READY"
      ? { modules: ModuleName[]; isReady: State_IsPipeCoreReady<{ state: "NOT_READY" }> }
      : never
  : never;

type fn<Context extends any, Config extends any> = (context: Context, config: Config) => Promise<void> | void;
type Diff<T, U> = T extends any & U ? (T extends infer R & U ? R : never) : never;

export * from "./internal-schema.js";
export type * from "./types/internal-schema-types.js";
