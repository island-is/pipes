#!/usr/bin/env node
/**
 * This runs after `yarn install`.
 * a) setup env
 * b) run husky
 * */

import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const _ENV_FILE = join(root, ".env.root");

// This will be written to the env file.
interface EnvContent {
  PIPES_PROJECT_ROOT: string;
  NODE_OPTIONS: string[];
  PIPES_LOCAL_DEV: string;
  NODE_ENV: string;
  FORCE_COLOR: string;
}

const EnvContent: EnvContent = {
  PIPES_PROJECT_ROOT: root,
  NODE_ENV: "production",
  FORCE_COLOR: "2",
  NODE_OPTIONS: [
    "--experimental-import-meta-resolve",
    "--no-warnings=ExperimentalWarning",
    "--enable-source-maps",
    `--experimental-loader=${root}/loader.mjs`,
  ],
  PIPES_LOCAL_DEV: "true",
};

const tasks = [
  async () => {
    const ENV_ARR: [string, string][] = [];
    for (const [key, entry] of Object.entries(EnvContent)) {
      let value: string;
      if (Array.isArray(entry)) {
        value = entry.join(" ");
      } else {
        value = entry;
      }
      ENV_ARR.push([key, value]);
    }
    const env = ENV_ARR.map(([key, value]) => `${key}=${value}`).join("\n");
    await writeFile(_ENV_FILE, env, "utf-8");
  },
  () => {
    /** HUSKY! */
    return new Promise((resolve) => {
      const child = spawn("husky", ["install"], {
        cwd: root,
      });
      child.on("close", (code) => {
        resolve(code == null ? 0 : code);
      });
    });
  },
];

if (import.meta.url === `file://${process.argv[1]}`) {
  await Promise.all(tasks.map((e) => e()));
}
