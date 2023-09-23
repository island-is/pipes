import { writeFile } from "node:fs/promises";
import os from "node:os";
import { join } from "node:path/posix";
import path from "path";

import { createPipesCore, createTask } from "@island-is/pipes-core";
import { PipesGitHub } from "@island-is/pipes-module-github";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";

import { GlobalConfig } from "../config.js";
import { devImageInstallContext } from "../install/dev-image.js";

import type { Simplify } from "@island-is/pipes-core";
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
}
const createBuildContext = (props: Props) => {
  const buildContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
  buildContext.config.appName = `Build ${props.relativeWorkDir}`;
  if (props.required) {
    buildContext.config.nodeWorkDir = (props.required.config as any).nodeWorkDir;
    buildContext.config.nodeImageKey = (props.required.config as any).nodeImageKey;
    buildContext.addDependency(props.required.symbol);
  }

  buildContext.addScript(async (context, config) => {
    const fn = (value: string) => {
      return context.nodeRun({ args: ["run", value], relativeCwd: props.relativeWorkDir });
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
        }
        (props.dependendants ?? []).forEach((dep) => {
          const newContext = createBuildContext({ required: buildContext, ...dep });
          context.addContextToCore({ context: newContext });
        });
        await Promise.all([fn("lint"), fn("test"), fn("build")]);
        if (GlobalConfig.action === "Release") {
          const container = await context.nodePrepareContainer();
          const packageJSONPath = join(config.nodeWorkDir, props.relativeWorkDir, "dist", "package.json");
          const packageJSON = JSON.parse(await container.file(packageJSONPath).contents());
          packageJSON.version = GlobalConfig.version;
          const packageJSONNew = JSON.stringify(packageJSON, null, 2);
          const packageJSONNewPath = path.join(os.tmpdir(), `${path.basename(props.relativeWorkDir)}.json`);
          await writeFile(packageJSONNewPath, packageJSONNew);
          const packageJSONNewFile = context.client.host().file(packageJSONNewPath);
          const newContainer = container.withFile(packageJSONPath, packageJSONNewFile);
          await (await context.imageStore).setKey(`node-${config.nodeImageKey}`, newContainer);
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
