import type { PipesNodeModule } from "../interface.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export const getContainer: removeContextCommand<PipesNodeModule["Context"]["Implement"]["nodeGetContainer"]> =
  async function getContainer(context, _config) {
    const version = await context.nodeGetVersion();
    return (await context.imageStore).getOrSet(`base-node-${version}`, () => {
      const container = context.client.container().from(`node:${version}`);
      return container;
    });
  };
