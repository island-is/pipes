import { createPipesCore } from "@islandis/pipes-module-core";
import { PipesNode } from "@islandis/pipes-module-node";
import { config } from "./config.js";
// TODO: Type generation is wrong
export const devImageInstallContext = createPipesCore().addModule(PipesNode);
devImageInstallContext.config.nodeSourceDir = config.sourceDir;
devImageInstallContext.config.appName = `Development install`;
devImageInstallContext.config.nodeImageKey = `dev-image`;
devImageInstallContext.config.nodeSourceIncludeOrExclude = "exclude";
// Skip node_modules and dist.
devImageInstallContext.config.nodeSourceExclude = [
    "**/node_modules",
    "**/dist",
    "**/.env*",
    "**/.git",
    "**/.github",
    "**/.devcontainer",
    "**/.husky"
];
export const devImageKey = devImageInstallContext.config.nodeImageKey;
export const devWorkDir = devImageInstallContext.config.nodeWorkDir;
devImageInstallContext.addScript(async (context)=>{
    await context.nodePrepareContainer();
});
