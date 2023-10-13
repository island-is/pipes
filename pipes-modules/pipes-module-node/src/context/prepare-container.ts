import type { PipesNodeModule } from "../interface.js";
import type { Container, removeContextCommand } from "@island.is/pipes-core";

export const prepareContainer: removeContextCommand<PipesNodeModule["Context"]["Implement"]["nodePrepareContainer"]> =
  async function prepareContainer(context, config) {
    return (await context.imageStore).getOrSet(`node-${config.nodeImageKey}`, async () => {
      const container = (await context.nodeGetContainer()).withWorkdir(config.nodeWorkDir);
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
      if (config.nodePackageManager === "yarn") {
        const isNode20 = await context.nodeIsVersionGreaterOrEqual({ version: 20 });
        let yarnContainer: Container;
        if (isNode20) {
          yarnContainer = await container
            .withDirectory(config.nodeWorkDir, source)
            .withWorkdir(config.nodeWorkDir)
            .withExec(["corepack", "enable"])
            .sync();
        } else {
          yarnContainer = await container
            .withDirectory(config.nodeWorkDir, source)
            .withWorkdir(config.nodeWorkDir)
            .withExec(["npm", "install", "-g", "yarn"])
            .sync();
        }
        const install = await yarnContainer.withWorkdir(config.nodeWorkDir).withExec(["yarn", "install"]).sync();
        return install.withWorkdir(config.nodeWorkDir);
      }
      throw new Error(`Package manager ${config.nodePackageManager} not implemented`);
    });
  };
