import fs from "node:fs";
import path from "node:path";

import { z } from "@island-is/pipes-core";

import { VERSION, YARN_VERSION } from "./const.js";
import { PackageJSON } from "./package-json.js";
import { sourceFile } from "./pipes.js";
import { createYARNRC } from "./yarnrc.js";

import type { WriteFileOptions } from "node:fs";

export function getAppPaths(root: string, appName: string): { appPath: string; srcPath: string } {
  const appPath = path.join(root, appName);
  const srcPath = path.join(appPath, "src");
  return { appPath, srcPath };
}

export function createDirectories(path: string): void {
  fs.mkdirSync(path, { recursive: true });
}

export function writeFile(filePath: string, content: string, encoding: WriteFileOptions = "utf-8"): void {
  fs.writeFileSync(filePath, content, encoding);
}

export function main(root = process.cwd(), appNameArg: string | undefined = undefined): void {
  const appName = z
    .string()
    .default(appNameArg, {
      arg: {
        long: "appName",
        positional: true,
      },
    })
    .parse(undefined);

  const { appPath, srcPath } = getAppPaths(root, appName);

  createDirectories(srcPath);

  writeFile(path.join(srcPath, "ci.tsx"), sourceFile);
  writeFile(path.join(appPath, "yarn.lock"), "");

  const packageJsonPath = path.join(appPath, "package.json");
  const packageJsonContent = PackageJSON({
    name: appName,
    yarnVersion: YARN_VERSION,
    version: VERSION,
  });
  writeFile(packageJsonPath, packageJsonContent);

  const yarnrcPath = path.join(appPath, ".yarnrc.yml");
  writeFile(yarnrcPath, createYARNRC());

  console.log("App has been created successfully.");
}
