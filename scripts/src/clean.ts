/* eslint-disable no-console */
/** @file Script to clean up */
/**
 * Clean up script
 */

import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";

const info = (...args: any[]) => console.log("scripts:clean:info", ...args);
const log = (...args: any[]) => console.log("scripts:clean:debug", ...args);
const logError = (...args: any[]) => console.error("scripts:clean:error", ...args);

/**
 * Clean all node_modules and dist folders
 * @param directories Directories to delete
 * @param dirName Directory to start from
 */
const deleteDirectories = async (directories: string[], dirName = "."): Promise<void> => {
  const files = await readdir(dirName, { withFileTypes: true });
  const dir = files.map((e) => {
    if (e.isDirectory() && directories.includes(e.name)) {
      log(`Deleting ${join(dirName, e.name)}`);
      return rm(join(dirName, e.name), { recursive: true });
    }
    if (e.isDirectory()) {
      return deleteDirectories(directories, join(dirName, e.name));
    }
  });
  await Promise.all(dir);
};

info("Starting clean up process");
void deleteDirectories(["node_modules", "dist", "cache", "unplugged"])
  .then(() => {
    info("Clean up process finished");
  })
  .catch((e) => {
    logError("Clean up process failed");
    logError(e);
  });
