#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { z } from "@island.is/zod";

import { DAGGER_VERSION, MOBX_VERSION, SWC_VERSION, VERSION, YARN_VERSION } from "./const.js";
import { PackageJSON } from "./package-json.js";
import { sourceFile } from "./pipes.js";
import { createYARNRC } from "./yarnrc.js";

function executeCommand(command: string, cwd: string) {
  try {
    execSync(command, { stdio: "inherit", cwd });
  } catch (error) {
    console.error(`Failed to execute command: ${command}`);
    process.exit(1);
  }
}

// Create a new app directory
const appName = z
  .string()
  .default(undefined, {
    arg: {
      long: "appName",
      positional: true,
    },
  })
  .parse(undefined);

const appPath = path.join(process.cwd(), appName);
const srcPath = path.join(appPath, "src");
fs.mkdirSync(srcPath, { recursive: true });

fs.writeFileSync(path.join(srcPath, "ci.ts"), sourceFile);
fs.writeFileSync(path.join(appPath, "yarn.lock"), sourceFile);

// Add "hehe" and "hoho" to dependencies
const packageJsonPath = path.join(appPath, "package.json");
fs.writeFileSync(
  packageJsonPath,
  PackageJSON({
    name: appName,
    mobxVersion: MOBX_VERSION,
    daggerVersion: DAGGER_VERSION,
    yarnVersion: YARN_VERSION,
    swcVersion: SWC_VERSION,
    version: VERSION,
  }),
  "utf-8",
);

const yarnrcPath = path.join(appPath, ".yarnrc.yml");
fs.writeFileSync(yarnrcPath, createYARNRC(), "utf-8");

executeCommand(`yarn install`, appPath);
console.log("App has been created successfully.");
