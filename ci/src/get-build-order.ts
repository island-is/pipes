/**
 * Library to be included from CI
 */
import { readFile } from "node:fs/promises";

import type { workspaceWithHashes } from "@island-is/scripts";

const buildOrderJSON = process.env["BUILD_ORDER_JSON"];

if (!buildOrderJSON) {
  throw new Error(`Env for build order not initialized`);
}
export const buildOrder = JSON.parse(await readFile(buildOrderJSON, "utf-8")) as workspaceWithHashes[][];
