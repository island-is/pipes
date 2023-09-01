import { connect } from "@dagger.io/dagger";
import {
  ConfigHasModule,
  ContextHasModule,
  createConfig,
  createContext,
  createModule,
  createPipesCore,
} from "@island.is/pipes-module-core";
import { createGlobalZodKeyStore, createZodStore, wrapContext, z } from "@island.is/zod";

import type { Client } from "@dagger.io/dagger";
import type { PipesCoreClass, PipesCoreModule, Simplify, createModuleDef } from "@island.is/pipes-module-core";

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
    await connect(
      async (client: Client) => {
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
        const contextPromises = await Promise.all(
          Array.from(this.#context).map(async (value) => {
            await value.run();
          }),
        );
        await Promise.race([fakePromise, contextPromises]);
      },
      { LogOutput: process.stdout },
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
  run: () => Promise<any> | any;
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
  createZodStore,
  createGlobalZodKeyStore,
  wrapContext,
};
export type { createModuleDef, PipesCoreModule, Simplify };
export * from "@dagger.io/dagger";
