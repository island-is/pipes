import type { PipesNodeModule } from "../interface.js";
import type { removeContextCommand } from "@island.is/pipes-core";

export const isVersionGreaterOrEqual: removeContextCommand<
  PipesNodeModule["Context"]["Implement"]["nodeIsVersionGreaterOrEqual"]
> = async function isVersionGreaterOrEqual(context, _config, { version }) {
  const nodeVersion = parseInt((await context.nodeGetVersion()).split(".").find((e) => e) ?? "0", 10);

  return nodeVersion >= version;
};
