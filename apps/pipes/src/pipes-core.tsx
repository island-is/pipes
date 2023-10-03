import { connect } from "@dagger.io/dagger";
import isInsideContainer from "is-inside-container";
import { reaction, when } from "mobx";
import React from "react";

import { PipesConfig } from "./config.js";
import {
  ConfigHasModule,
  ContextHasModule,
  createConfig,
  createContext,
  createInternalState,
  createModule,
  createPipesCore,
  createState,
  internalStateStoreSchema,
  taskSchema,
} from "./core/index.js";
import { DynamicPromiseAggregator } from "./dynamic.js";
import { PipesStream } from "./stream.js";
import { onCleanup } from "./utils/cleanup/cleanup.js";
import * as PipesDOM from "./utils/dom/dom.js";
import { forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED } from "./utils/ink/render.js";
import {
  createBasicZodStore,
  createGlobalZodKeyStore,
  createGlobalZodStore,
  createZodKeyStore,
  createZodStore,
  createZodSymbolStore,
  z,
} from "./utils/zod/zod.js";

import type { InternalStateStore, PipesCoreClass, PipesCoreModule, Simplify, createModuleDef } from "./core/index.js";
import type { Client } from "@dagger.io/dagger";

export class PipesCoreRunner {
  #context: Set<PipesCoreClass> = new Set();

  addContext(value: PipesCoreClass): () => void {
    this.#context.add(value);
    return () => {
      this.removeContext(value);
    };
  }
  #injectContext = (_context: any, _config: any, props: { context: PipesCoreClass }): void => {
    if (!this.#client) {
      // We haven't started so this is not injection
      this.addContext(props.context);
      return;
    }
    this.#contextPromiseAggregator.addPromise(this.#processContext(props.context));
  };
  removeContext(value: PipesCoreClass): void {
    this.#context.delete(value);
  }
  #_haltObj: { halt?: (value: string) => Promise<void> | void } = {};
  #halt = (e?: any) => {
    if (this.#_haltObj.halt) {
      void this.#_haltObj.halt(e ? JSON.stringify(e) : "Forced quit");
    } else {
      // Give clean-up time force quit if not
      setTimeout(() => {
        process.exit(1);
      }, 500);
    }
  };
  #client: Client | null = null;
  async #processContext(value: PipesCoreClass): Promise<void> {
    if (!this.#client) {
      throw new Error(`Client not set`);
    }
    value.client = this.#client;
    value.haltAll = this.#halt;
    value.addContext = this.#injectContext;
    const internalState = createInternalState();
    this.#tasks.value = [...this.#tasks.value, value.symbol];

    this.#store.symbolsOfTasks = [...this.#store.symbolsOfTasks, value.symbol];
    reaction(
      () => {
        return {
          name: internalState.name,
          state: internalState.state,
        };
      },
      async () => {
        const name = internalState.name;
        const state = internalState.state;
        await this.#taskState.setKey(value.symbol, { name, state });
      },
    );

    void when(() => internalState.state === "finished" || internalState.state === "failed").then(() => {
      if (internalState.state === "finished") {
        this.#store.symbolsOfTasksCompleted = [...this.#store.symbolsOfTasksCompleted, value.symbol];
        return;
      }
      if (internalState.state === "failed") {
        this.#store.symbolsOfTasksFailed = [...this.#store.symbolsOfTasksFailed, value.symbol];
      }
    });
    await value.run(this.#store, internalState).catch(async (e) => {
      internalState.state = "failed";
      if (e instanceof PipesDOM.DOMError) {
        await PipesDOM.render(<PipesDOM.PipesObject value={e} />);
      } else {
        await PipesDOM.render(
          <PipesDOM.Error>
            <PipesDOM.PipesObject value={e} />
          </PipesDOM.Error>,
        );
      }
      this.#halt();
    });
  }
  #fakePromise = new Promise<void>((_resolve, reject) => {
    this.#_haltObj.halt = reject;
  });
  #contextPromiseAggregator = new DynamicPromiseAggregator();
  #contextPromise = this.#contextPromiseAggregator.watch();
  #pipesStream = new PipesStream();
  #tasks = createBasicZodStore(taskSchema);
  #store = createState();
  #taskState = createZodSymbolStore(internalStateStoreSchema);
  #daggerState = createBasicZodStore(
    z
      .union([
        z.literal("Connecting"),
        z.literal("Connected"),
        z.literal("Finished"),
        z.object({
          type: z.literal("Failed"),
          error: z.any(),
        }),
      ])
      .default("Connecting"),
  );
  #renderDaggerInfo() {
    return PipesDOM.render(() => {
      return (
        <PipesDOM.Group title="Dagger state">
          <PipesDOM.Container>
            {((daggerState) => {
              if (daggerState.value === "Connecting") {
                return <PipesDOM.Log>Connecting to Dagger</PipesDOM.Log>;
              }
              if (daggerState.value === "Connected") {
                return <PipesDOM.Info>Connected to Dagger</PipesDOM.Info>;
              }
              if (daggerState.value === "Finished") {
                return <PipesDOM.Success>Dagger Finished</PipesDOM.Success>;
              }
              if (typeof daggerState.value === "object" && daggerState.value.type === "Failed") {
                return <PipesDOM.Error>{daggerState.value.error}</PipesDOM.Error>;
              }
            })(this.#daggerState)}
          </PipesDOM.Container>
        </PipesDOM.Group>
      );
    });
  }
  #renderTaskState() {
    return PipesDOM.render(async () => {
      const currentTasks = [...this.#tasks.value];
      const obj: InternalStateStore[] = [];
      const values = await this.#taskState.getAll();
      for (const task of currentTasks) {
        const value = values[task];
        if (value) {
          obj.push(value);
        }
      }
      const getState = (state: string) =>
        state.split("_").reduce((a, b, index) => {
          if (index === 0) {
            return b
              .split("")
              .map((e, index) => {
                return index === 0 ? e.toUpperCase() : e;
              })
              .join("");
          }
          return `${a} ${b}`;
        }, "");
      const tableValues = obj.map((e) => ({ Name: e.name, State: getState(e.state) }));
      if (tableValues.length === 0) {
        return <></>;
      }
      return (
        <>
          <PipesDOM.Group title="Pipes tasks changes">
            <PipesDOM.Container>
              <PipesDOM.Table data={tableValues} />
            </PipesDOM.Container>
          </PipesDOM.Group>
        </>
      );
    });
  }
  #renderRawLog() {
    if (!PipesConfig.isDev) {
      return;
    }
    const value = this.#pipesStream.getData();
    forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED(
      <PipesDOM.Group title="Raw Dagger log">
        <PipesDOM.Text>{value}</PipesDOM.Text>
      </PipesDOM.Group>,
    );
  }
  async run(): Promise<void> {
    const isRunningInsideContainer = async () => {
      const isContainarised = isInsideContainer();
      if (!isContainarised) {
        await PipesDOM.render(<PipesDOM.Info>This should run inside container for best usage.</PipesDOM.Info>, {
          forceRenderNow: true,
        });
      }
    };

    await isRunningInsideContainer();
    onCleanup(() => {
      // If program quits for some reason print out the logs if needed
      this.#renderRawLog();
    });
    await this.#renderDaggerInfo();
    await connect(
      async (client: Client) => {
        this.#daggerState.value = "Connected";
        this.#client = client;
        await this.#renderTaskState();

        /** Add all context */
        this.#contextPromiseAggregator.addPromise(
          Array.from(this.#context).map((value) => {
            return this.#processContext(value);
          }),
        );

        this.#store.state = "running";
        await Promise.race([this.#fakePromise, this.#contextPromise]);
      },
      { LogOutput: this.#pipesStream },
    )
      .catch((e) => {
        this.#daggerState.value = {
          type: "Failed",
          error: e,
        };
      })
      .then(() => {
        if (this.#daggerState.value === "Connected") {
          this.#daggerState.value = "Finished";
        }
      })
      .finally(() => {
        setTimeout(() => {
          // TODO: fix this
          // Give time render and jobs to quit safely.
          if (this.#daggerState.value === "Finished") {
            process.exit(0);
          }
          process.exit(1);
        }, 2000);
      });
  }
}

interface CreatePipeProps {
  z: typeof z;
  createPipesCore: typeof createPipesCore;
  createConfig: typeof createConfig;
  createModule: typeof createModule;
  createContext: typeof createContext;
  contextHasModule: typeof ContextHasModule;
  configHasModule: typeof ConfigHasModule;
}

interface PipeBase {
  run: (value: any, state: any) => Promise<any> | any;
  client: Client | null | undefined;
}

export const createPipe = async (
  // eslint-disable-next-line no-shadow
  fn: ({ z, createPipesCore }: CreatePipeProps) => Promise<PipeBase[]> | PipeBase[],
): Promise<void> => {
  const core = new PipesCoreRunner();
  const values = await fn({
    z,
    createPipesCore,
    createConfig,
    createContext,
    createModule,
    contextHasModule: ContextHasModule,
    configHasModule: ConfigHasModule,
  });
  for (const value of values) {
    // If we define this better we get circular errors…
    core.addContext(value as PipesCoreClass);
  }
  await core.run();
};

export {
  createConfig,
  createContext,
  createModule,
  z,
  PipesCoreClass,
  PipesDOM,
  createZodStore,
  createZodKeyStore,
  createGlobalZodKeyStore,
  createGlobalZodStore,
};
export * from "./utils/zod/base-zod/index.js";
export type { createModuleDef, PipesCoreModule, Simplify };
export * from "./core/index.js";
export * from "@dagger.io/dagger";
export * from "./utils/find-pnp-root/find-pnp-root.js";
export * from "./utils/cleanup/cleanup.js";
export * from "./utils/get-nvm-version/get-nvm-version.js";
export * from "./utils/base-utils/base-utils.js";
export type { removeContextCommand } from "./core/types/remove-context-command.js";
