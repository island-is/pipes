import React from "react";
import { PipesDOM, createPipesCore, createTask } from "@island-is/pipes-core";
import { PipesGitHub } from "@island-is/pipes-module-github";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";

import { GlobalConfig } from "../config.js";
import { devImageInstallContext } from "../install/dev-image.js";

import type { Simplify } from "@island-is/pipes-core";
import type { PipesGitHubModule } from "@island-is/pipes-module-github";
import render from "@island-is/pipes-core/src/utils/ink/render.js";

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
    const fn = async (value: string) => {
      const stateValue = await context.nodeRun({ args: ["run", value], relativeCwd: props.relativeWorkDir });
      if (stateValue.state === "Error" ) {
        await PipesDOM.render(() => {
        return (
          <PipesDOM.Error>
            <PipesDOM.Text color={"cyan"}>{value}:</PipesDOM.Text>
            <PipesDOM.Text>Failed </PipesDOM.Text><PipesDOM.Text bold={true}>{value}</PipesDOM.Text> 
          </PipesDOM.Error>
        ); 
        }, {
          forceRenderNow: true,
        });
        context.haltAll();
        throw new Error(`Failed ${value}`);
      }
    };
    await createTask(
      async () => {
        if (GlobalConfig.action === "Release" && GlobalConfig.npmAuthToken && GlobalConfig.version) {
          const publishContext = createPipesCore()
            .addModule<PipesNodeModule>(PipesNode)
            .addModule<PipesGitHubModule>(PipesGitHub);
          publishContext.config.nodeWorkDir = buildContext.config.nodeWorkDir;
          publishContext.config.nodeImageKey = buildContext.config.nodeImageKey;
          publishContext.addScript(async (context) => {
            await context.githubNodePublish({
              token: GlobalConfig.npmAuthToken,
              relativeWorkDir: `${props.relativeWorkDir}/dist`,
            });
          });
          context.addContextToCore({context: publishContext});
        }
        (props.dependendants ?? []).forEach((dep) => {
          const newContext = createBuildContext({ required: buildContext, ...dep });
          context.addContextToCore({ context: newContext });
        });
        await Promise.all([fn("lint"), fn("test"), fn("build")]);
        if (GlobalConfig.action === "Release") {
          await context.nodeModifyPackageJSON({
            relativeCwd: props.relativeWorkDir,
            fn: (packageJSON) => {
              packageJSON.version = GlobalConfig.version;
              return packageJSON;
            },
          });
        }
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
