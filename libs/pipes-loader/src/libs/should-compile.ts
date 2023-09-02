import { extname } from "node:path";

import { allowed_extension } from "../const.js";

import { doesFileExists } from "./does-file-exist.js";

/**
 * Checks if the file is ts, tsx or has a typescript file with different ending
 * @param path path to fs
 * @returns string if it exists else null
 */
export async function shouldCompile(path: string): Promise<string | null> {
  const fileIsHere = await doesFileExists(path);
  if (fileIsHere) {
    const currentExtension = extname(path);
    if (allowed_extension.includes(currentExtension)) {
      return path;
    }
    return null;
  }
  for (const extension of allowed_extension) {
    const newPath = path.replace(/(\.[^.]+)$/, extension);
    const newFileExists = await doesFileExists(newPath);
    if (newFileExists) {
      return newPath;
    }
  }
  return null;
}
