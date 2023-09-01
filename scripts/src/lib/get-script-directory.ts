/**
 * @file Get the root of the script directory.
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Returns the directory path of the script file.
 */
export const getScriptDirectory = (): string => {
  return dirname(dirname(dirname(fileURLToPath(import.meta.url))));
};
