import { dirname } from "node:path";

import { convertURL } from "./convert-url.js";
import { isDirectory } from "./is-directory.js";

/**
 * Checks if the string is a file or directory. Returns directory.
 * @param url fs location
 * @returns null if no directory found or string. Returns dirname of file if file, else path.
 */
export async function convertURLToDirectory(url: string | null | undefined): Promise<string | null> {
  if (!url) {
    return null;
  }
  const path = convertURL(url);
  if (!path) {
    return null;
  }
  if (await isDirectory(path)) {
    return path;
  }
  const rootDirectory = dirname(path);
  if (await isDirectory(rootDirectory)) {
    return rootDirectory;
  }
  return null;
}
