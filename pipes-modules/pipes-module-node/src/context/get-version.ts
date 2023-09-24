import { getNvmVersion } from "@island-is/pipes-core";

import type { PipesNodeModule } from "../interface.js";
import type { removeContextCommand } from "@island-is/pipes-core";

export const getVersion: removeContextCommand<PipesNodeModule["Context"]["Implement"]["nodeGetVersion"]> =
  async function getVersion(_context, config) {
    if (config.nodeVersion === "AUTO") {
      // TODO move to async:
      const nodeVersion = await getNvmVersion(config.nodeSourceDir);
      config.nodeVersion = nodeVersion;
    }
    return config.nodeVersion;
  };
