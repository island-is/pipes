import { createPipesCore, createTask } from "@island-is/pipes-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";

import { devImageInstallContext } from "../install/dev-image.js";

import type { Simplify } from "@island-is/pipes-core";

type RemoveAllKeysStartingWithHash<T> = {
  [K in keyof T as string extends K ? never : K extends `${"#"}${infer _Rest}` ? never : K]: T[K];
};

const _context = createPipesCore().addModule<PipesNodeModule>(PipesNode);
type Context = Simplify<RemoveAllKeysStartingWithHash<typeof _context>>;

interface Dependentans {
  relativeWorkDir: string;
  dependendants?: Dependentans[];
}

interface Props extends Dependentans {
  required?: Context;
}
const createBuildContext = (props: Props) => {
  const buildContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
  buildContext.config.appName = `Build ${props.relativeWorkDir}`;
  if (props.required) {
    buildContext.config.nodeWorkDir = (props.required.config as any).nodeWorkDir;
    buildContext.config.nodeImageKey = (props.required.config as any).nodeImageKey;
    buildContext.addDependency(props.required.symbol);
  }

  buildContext.addScript(async (context) => {
    const fn = (value: string) => {
      return context.nodeRun({ args: ["run", value], relativeCwd: props.relativeWorkDir });
    };
    await createTask(
      async () => {
        (props.dependendants ?? []).forEach((dep) => {
          const newContext = createBuildContext({ required: buildContext, ...dep });
          context.addContextToCore({ context: newContext });
        });
        await Promise.all([fn("lint"), fn("test"), fn("build")]);
      },
      {
        inProgress: `Building ${props.relativeWorkDir}`,
        finished: `Built ${props.relativeWorkDir}`,
        error: `Building ${props.relativeWorkDir} failed`,
      },
      context,
    );
  });
  return buildContext;
};

export const buildCoreContext = createBuildContext({
  required: devImageInstallContext,
  relativeWorkDir: "./apps/pipes",
  dependendants: [
    {
      relativeWorkDir: "./apps/create-pipes",
    },
    {
      relativeWorkDir: "./pipes-modules/pipes-module-github",
    },
    {
      relativeWorkDir: "./pipes-modules/pipes-module-node",
    },
  ],
});
