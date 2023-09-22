import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";

import { devBuildOrderContext, devBuildOrderImageKey } from "../builder-order/build-order.js";
import { devWorkDir } from "../install/dev-image.js";

export const devWithDistImageKey = `${devBuildOrderImageKey}-dist`;

/**
 * Builds packages for testing and deploying.
 * NOTE: Some linter behaviour fails if type is not ready.
 * So this should run first.
 */
export const buildContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);
buildContext.config.appName = `Build`;
buildContext.config.nodeWorkDir = devWorkDir;
buildContext.config.nodeImageKey = devBuildOrderImageKey;
buildContext.addDependency(devBuildOrderContext.symbol);
buildContext.addScript(async (context, config) => {});
