import { PipesDOM, createPipesCore, createTask } from "@island-is/pipes-core";
import { PipesGitHub } from "@island-is/pipes-module-github";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";
import React from "react";

import { GlobalConfig } from "../config.js";
import { devImageInstallContext } from "../install/dev-image.js";

import type { Container, Simplify } from "@island-is/pipes-core";
import type { PipesGitHubModule } from "@island-is/pipes-module-github";

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
  imageKey?: string;
}
const createBuildContext = (props: Props) => {
  const buildContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
  buildContext.config.appName = `Build ${props.relativeWorkDir}`;
  if (props.required) {
    buildContext.config.nodeWorkDir = devImageInstallContext.config.nodeWorkDir;
    buildContext.config.nodeImageKey = (props.required.config as any).nodeImageKey;
    buildContext.addDependency(props.required.symbol);
  }
  if (props.imageKey) {
    buildContext.config.nodeImageKey = props.imageKey;
  }
  buildContext.addScript(async (context, config) => {
    let container: Container;
    const newKey = `${config.nodeImageKey}-build-${props.relativeWorkDir}`;
    const fn = async (value: string) => {
      const stateValue = await context.nodeRun({ args: ["run", value], relativeCwd: props.relativeWorkDir });
      if (stateValue.state === "Error") {
        await PipesDOM.render(
          () => {
            return (
              <PipesDOM.Error>
                <PipesDOM.Text color={"cyan"}>{value}:</PipesDOM.Text>
                <PipesDOM.Text>Failed </PipesDOM.Text>
                <PipesDOM.Text bold={true}>{value}</PipesDOM.Text>
              </PipesDOM.Error>
            );
          },
          {
            forceRenderNow: true,
          },
        );
        context.haltAll();
        throw new Error(`Failed ${value} with error ${JSON.stringify(stateValue.error)}`);
      } else if (stateValue.state === "Success" && value === "build") {
        container = stateValue.container;
      }
    };
    await createTask(
      async () => {
        await Promise.all([fn("lint"), fn("test"), fn("build")]);
        if (!container) {
          throw new Error(`Container not set`);
        }
        await (await context.imageStore).setKey(`node-${newKey}`, container);
        if (GlobalConfig.action === "Release" && GlobalConfig.npmAuthToken && GlobalConfig.version) {
          const publishContext = createPipesCore()
            .addModule<PipesNodeModule>(PipesNode)
            .addModule<PipesGitHubModule>(PipesGitHub);
          publishContext.config.nodeWorkDir = buildContext.config.nodeWorkDir;
          publishContext.addDependency(buildContext.symbol);
          publishContext.config.nodeImageKey = newKey;
          publishContext.addScript(async (context) => {
            await context.githubNodePublish({
              token: GlobalConfig.npmAuthToken,
              relativeWorkDir: "./dist",
              unpublish: "ifExists",
            });
          });
          context.addContextToCore({ context: publishContext });
        }
        (props.dependendants ?? []).forEach((dep) => {
          const newContext = createBuildContext({ required: buildContext, ...dep, imageKey: newKey });
          context.addContextToCore({ context: newContext });
        });
      },
      {
        inProgress: `Building ${props.relativeWorkDir}`,
        finished: `Built ${props.relativeWorkDir}`,
        error: `Building ${props.relativeWorkDir} failed`,
      },
      context as any,
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
      relativeWorkDir: "./pipes-modules/pipes-module-node",
      dependendants: [
        {
          relativeWorkDir: "./pipes-modules/pipes-module-github",
        },
      ],
    },
  ],
});
