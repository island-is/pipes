import { readFileSync } from "node:fs";
import { join } from "node:path";

import { findPnpRoot } from "@island.is/find-pnp-root";

const baseDir: Record<string, string> = {};

export const getNvmVersion = (root: string = process.cwd()): string => {
  const path = findPnpRoot(root);
  if (baseDir[path]) {
    return baseDir[path];
  }
  let version: null | string = null;
  [".nvmrc", ".node-version"]
    .map((file) => {
      return () => {
        const nvmrc = join(path, file);
        try {
          return readFileSync(nvmrc, "utf-8");
        } catch (_e) {
          return null;
        }
      };
    })
    .find((fn) => {
      const value = fn();
      if (value != null) {
        version = value;
        return true;
      }
      return false;
    });
  if (version && typeof version === "string") {
    baseDir[path] = (version as string).trim();
    return baseDir[path];
  }
  throw new Error("Not found");
};
