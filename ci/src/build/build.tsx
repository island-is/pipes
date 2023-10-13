import { PipesDOM, createPipesCore, createTask } from "@island.is/pipes-core";
import { PipesGitHub } from "@island.is/pipes-module-github";
import { PipesNode, type PipesNodeModule } from "@island.is/pipes-module-node";
import React from "react";

import { automergeContext } from "../automerge/automerge.js";
import { GlobalConfig } from "../config.js";
import { devImageInstallContext } from "../install/dev-image.js";

import type { Container, PipesCoreClass, PipesCoreModule } from "@island.is/pipes-core";
import type { PipesGitHubModule } from "@island.is/pipes-module-github";

interface Dependentans {
  name: string;
  relativeWorkDir: string;
  dependendants?: Dependentans[];
}

interface Props extends Dependentans {
  createRelease?: boolean;
  name: string;
  required?: PipesCoreClass<[PipesCoreModule, PipesNodeModule]>;
  imageKey?: string;
}
const createBuildContext = (props: Props) => {
  const buildContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
  automergeContext.addDependency(buildContext.symbol);
  buildContext.config.appName = `Build ${props.relativeWorkDir}`;
  if (props.required) {
    buildContext.config.nodeWorkDir = devImageInstallContext.config.nodeWorkDir;
    buildContext.config.nodeImageKey = props.required.config.nodeImageKey;
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
          automergeContext.addDependency(publishContext.symbol);
          publishContext.config.appName = `Deploy ${props.relativeWorkDir}`;
          publishContext.config.nodeWorkDir = buildContext.config.nodeWorkDir;
          publishContext.addDependency(buildContext.symbol);
          publishContext.config.nodeImageKey = newKey;
          publishContext.config.githubToken = GlobalConfig.npmAuthToken;
          publishContext.addScript(async (context) => {
            if (props.createRelease) {
              await context.githubRelease({ version: GlobalConfig.version });
            }
            const files = (await context.nodePrepareContainer()).directory("./dist");
            await Promise.all([
              context.githubNodePublish({
                token: GlobalConfig.npmAuthToken,
                relativeWorkDir: "./dist",
                unpublish: "ifExists",
              }),
              context.githubUploadArtifact({ files, name: props.name, version: GlobalConfig.version }),
            ]);
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
  name: "pipes-core",
  required: devImageInstallContext,
  relativeWorkDir: "./apps/pipes",
  createRelease: true,
  dependendants: [
    {
      name: "create-pipes",
      relativeWorkDir: "./apps/create-pipes",
    },
    {
      name: "pipes-module-node",
      relativeWorkDir: "./pipes-modules/pipes-module-node",
      dependendants: [
        {
          name: "pipes-module-github",
          relativeWorkDir: "./pipes-modules/pipes-module-github",
        },
      ],
    },
  ],
});
