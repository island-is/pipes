import { connect } from "@dagger.io/dagger";
import { DOMError, PipesDOM } from "@island-is/dom";
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
  render,
  taskSchema,
} from "@island-is/pipes-module-core";
import {
  createBasicZodStore,
  createGlobalZodKeyStore,
  createGlobalZodStore,
  createZodKeyStore,
  createZodStore,
  createZodSymbolStore,
  z,
} from "@island-is/zod";
import { reaction, when } from "mobx";

import { PipesConfig } from "./config.js";
import { PipesStream } from "./stream.js";

import type { Client } from "@dagger.io/dagger";
import type {
  InternalStateStore,
  PipesCoreClass,
  PipesCoreModule,
  Simplify,
  createModuleDef,
} from "@island-is/pipes-module-core";

export class PipesCoreRunner {
  #context: Set<PipesCoreClass> = new Set();

  addContext(value: PipesCoreClass): () => void {
    this.#context.add(value);
    return () => {
      this.removeContext(value);
    };
  }
  removeContext(value: PipesCoreClass): void {
    this.#context.delete(value);
  }
  async run(): Promise<void> {
    const pipesStream = new PipesStream();
    const tasks = createBasicZodStore(taskSchema);
    const store = createState();
    const taskState = createZodSymbolStore(internalStateStoreSchema);
    const daggerState = createBasicZodStore(
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
    render(() => {
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
                return (
                  <>
                    <PipesDOM.Error>Dagger Failed</PipesDOM.Error>
                    <PipesDOM.Error>{JSON.stringify(daggerState.value.error)}</PipesDOM.Error>
                  </>
                );
              }
            })(daggerState)}
          </PipesDOM.Container>
        </PipesDOM.Group>
      );
    });
    await connect(
      async (client: Client) => {
        daggerState.value = "Connected";
        render(async () => {
          const currentTasks = [...tasks.value];
          const obj: InternalStateStore[] = [];
          const values = await taskState.getAll();
          for (const task of currentTasks) {
            const value = values[task];
            obj.push(value);
          }
          return (
            <>
              <PipesDOM.Group title="Pipes tasks changes">
                <PipesDOM.Container>
                  <PipesDOM.Table>
                    {obj.map(({ name, state }) => {
                      return (
                        <PipesDOM.TableRow>
                          <PipesDOM.TableCell>{name}</PipesDOM.TableCell>
                          <PipesDOM.TableCell>{state}</PipesDOM.TableCell>
                        </PipesDOM.TableRow>
                      );
                    })}
                  </PipesDOM.Table>
                </PipesDOM.Container>
              </PipesDOM.Group>
            </>
          );
        });
        const _haltObj: { halt?: (value: string) => Promise<void> | void } = {};
        const halt = () => {
          if (_haltObj.halt) {
            void _haltObj.halt("Forced quit");
          } else {
            process.exit(1);
          }
        };
        const fakePromise = new Promise<void>((_resolve, reject) => {
          _haltObj.halt = reject;
        });
        for (const context of this.#context) {
          context.client = client;
          context.haltAll = halt;
        }
        const contextPromises = Promise.all(
          Array.from(this.#context).map(async (value) => {
            const internalState = createInternalState();
            tasks.value = [...tasks.value, value.symbol];

            store.symbolsOfTasks = [...store.symbolsOfTasks, value.symbol];
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
                await taskState.setKey(value.symbol, { name, state });
              },
            );

            void when(() => internalState.state === "finished" || internalState.state === "failed").then(() => {
              if (internalState.state === "finished") {
                store.symbolsOfTasksCompleted = [...store.symbolsOfTasksCompleted, value.symbol];
                return;
              }
              if (internalState.state === "failed") {
                store.symbolsOfTasksFailed = [...store.symbolsOfTasksFailed, value.symbol];
              }
            });
            await value.run(store, internalState).catch((e) => {
              internalState.state = "failed";
              if (e instanceof DOMError) {
                render(e.get);
              }
              throw e;
            });
          }),
        );
        store.state = "running";
        await Promise.race([fakePromise, contextPromises]);
      },
      { LogOutput: pipesStream },
    )
      .catch((e) => {
        daggerState.value = {
          type: "Failed",
          error: e,
        };
      })
      .then(() => {
        if (daggerState.value === "Connected") {
          daggerState.value = "Finished";
        }
      })
      .finally(() => {
        if (PipesConfig.isDev) {
          const value = pipesStream.getData();
          render(() => <PipesDOM.Group title="Raw Dagger log">{value}</PipesDOM.Group>);
        }
        if (daggerState.value === "Finished") {
          process.exit(0);
        }
        process.exit(1);
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
  render,
};

export type { createModuleDef, PipesCoreModule, Simplify };
export * from "@dagger.io/dagger";
export * from "@island-is/cleanup";
