import type { PipesNodeModule } from "../interface.js";
import type { removeContextCommand } from "@island-is/pipes-core";

export const prepareContainer: removeContextCommand<PipesNodeModule["Context"]["Implement"]["nodePrepareContainer"]> =
  async function prepareContainer(context, config) {
    return (await context.imageStore).getOrSet(`node-${config.nodeImageKey}`, async () => {
      const container = await context.nodeGetContainer();
      const sourceOptions = {
        ...(config.nodeSourceIncludeOrExclude === "include" ||
        config.nodeSourceIncludeOrExclude === "include-and-exclude"
          ? {
              include: config.nodeSourceInclude,
            }
          : {}),
        ...(config.nodeSourceIncludeOrExclude === "exclude" ||
        config.nodeSourceIncludeOrExclude === "include-and-exclude"
          ? {
              exclude: config.nodeSourceExclude,
            }
          : {}),
      };
      // Currently we are just using yarn
      const source = context.client.host().directory(config.nodeSourceDir, sourceOptions);
      const corepack = await container
        .withDirectory(config.nodeWorkDir, source)
        .withWorkdir(config.nodeWorkDir)
        .withExec(["corepack", "enable"])
        .sync();
      const yarnInstall = await corepack.withExec(["yarn", "install"]).sync();
      return yarnInstall;
    });
  };
