import { connect } from "@dagger.io/dagger";
import { PipesDOM } from "@island-is/dom";
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
  createGlobalSymbolStore,
  createGlobalZodKeyStore,
  createGlobalZodStore,
  createZodKeyStore,
  createZodStore,
  z,
} from "@island-is/zod";
import { autorun, when } from "mobx";

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
    const taskState = await createGlobalSymbolStore(internalStateStoreSchema, "global-tasks-store");
    await connect(
      async (client: Client) => {
        render(
          async () => {
            const currentTasks = [...tasks.value];
            const obj: InternalStateStore[] = [];
            for (const task of currentTasks) {
              const fetchValue = await taskState.awaitForAvailability(task);
              if (fetchValue) {
                // Every key so store knows we are observing them
                const value: InternalStateStore = {
                  name: fetchValue.name,
                  state: fetchValue.state,
                };
                obj.push(value);
              }
            }
            return {
              tasks: obj,
            };
          },
          ({ tasks }) => {
            return (
              <>
                <PipesDOM.Group title="Pipes info">
                  <PipesDOM.Container>
                    <PipesDOM.Info>Connected to dagger</PipesDOM.Info>
                    <PipesDOM.Table>
                      <PipesDOM.Title>Tasks</PipesDOM.Title>
                      <PipesDOM.TableHeadings>
                        <PipesDOM.TableCell>Name</PipesDOM.TableCell>
                        <PipesDOM.TableCell>Task</PipesDOM.TableCell>
                      </PipesDOM.TableHeadings>
                      {tasks.map(({ name, state }) => {
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
          },
        );
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
            autorun(async () => {
              await taskState.setKey(value.symbol, internalState);
            });

            store.symbolsOfTasks = [...store.symbolsOfTasks, value.symbol];
            void when(() => internalState.state === "finished" || internalState.state === "failed").then(() => {
              if (internalState.state === "finished") {
                store.symbolsOfTasksCompleted = [...store.symbolsOfTasksCompleted, value.symbol];
                return;
              }
              if (internalState.state === "failed") {
                store.symbolsOfTasksFailed = [...store.symbolsOfTasksFailed, value.symbol];
              }
            });
            await value.run(store, internalState).catch(() => {
              internalState.state = "failed";
            });
          }),
        );
        store.state = "running";
        await Promise.race([fakePromise, contextPromises]);
      },
      { LogOutput: pipesStream },
    );
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
