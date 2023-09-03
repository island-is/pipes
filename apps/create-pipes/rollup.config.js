import { builtinModules } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const currentPath = fileURLToPath(dirname(import.meta.url));
/** @type {{main: string, dist: string, source: string, dependencies: Record<string, string>, peerDependencies: Record<string, string>, types: string}} */
const packageJSON = JSON.parse(await readFile(join(currentPath, "package.json"), "utf-8"));
const input = join(currentPath, ...packageJSON.source.replace("./", "").split("/"));
const output = join(currentPath, ...packageJSON.main.replace("./", "").split("/"));
const types = join(currentPath, ...packageJSON.types.replace("./", "").split("/"));

export const files = {
  main: output,
  source: input,
  types,
};
const config = {
  input: files.source,
  output: {
    sourcemap: true,
    file: files.main,
    format: "esm",
  },
  plugins: [
    {
      name: "island-is-resolve",
      resolveId(source) {
        try {
          const file = import.meta.resolve?.(source);
          return file.replace("file:///", "/");
        } catch {
          return null;
        }
      },
    },
  ],
  external: [
    ...builtinModules.map((e) => `node:${e}`),
    "mobx",
    "@swc/core",
    "glob",
    "@dagger.io/dagger",
    "@island.is/pipes-core",
  ],
};

export default config;
