/**
 * @file get the nearest base dir of a project
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const baseDir: Record<string, string> = {};

// This returns the base dir of the project.
export const findPnpRoot = (path: string): string => {
  if (baseDir[path]) {
    return baseDir[path];
  }
  const file = existsSync(join(path, "./.yarnrc.yml"));
  if (file) {
    baseDir[path] = path;
    return path;
  }
  const newPath = join(path, "..");
  if (path === newPath) {
    throw new Error("Could not find root");
  }
  const basePath = findPnpRoot(newPath);
  baseDir[path] = basePath;
  return basePath;
};
