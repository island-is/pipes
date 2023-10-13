import type { PipesNodeModule } from "../interface.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export const addEnv: removeContextCommand<PipesNodeModule["Context"]["Implement"]["nodeAddEnv"]> =
  async function addEnv(context, config, { container, env }) {
    const imageStore = await context.imageStore;
    const usedContainer = container || (await imageStore.awaitForAvailability(`node-${config.nodeImageKey}`));
    const newContainer = context.addEnv({ container: usedContainer, env });
    return newContainer;
  };
