import { join } from "node:path";

import { convertURL } from "./convert-url.js";
import { isRelativePath } from "./is-relative-path.js";

/**
 * Returns absolute path.
 * @param path path to file
 * @param parent path to parent
 * @returns string - absolute path
 */
export const convertFilePath = (path: string, parent: string | null | undefined): string => {
  const filePath = convertURL(path);
  if (!filePath) {
    throw new Error("Invalid url!");
  }
  if (filePath && isRelativePath(filePath)) {
    return join(parent || process.cwd(), filePath);
  }
  return filePath;
};
