import { builtinModules } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { getAllWorkspaces } from "@island.is/scripts";

const workspaces = await (async () => {
  return (await getAllWorkspaces()).reduce((a, b) => {
    return {
      [b.name]: b.files.sourceFile,
      ...a,
    };
  }, {});
})();

const currentPath = fileURLToPath(dirname(import.meta.url));
/** @type {{main: string, dist: string, source: string, dependencies: Record<string, string>, peerDependencies: Record<string, string>, types: string}} */
const packageJSON = JSON.parse(await readFile(join(currentPath, "package.json"), "utf-8"));
const input = join(currentPath, ...packageJSON.source.replace("./", "").split("/"));
const output = join(currentPath, ...packageJSON.main.replace("./", "").split("/"));
const types = join(currentPath, ...packageJSON.types.replace("./", "").split("/"));
console.log({ input, output, types });
const external = Object.keys({ ...packageJSON.dependencies, ...packageJSON.peerDependencies });
export const files = {
  main: output,
  source: input,
  types,
};
const config = {
  input,
  output: {
    sourcemap: true,
    file: output,
    format: "esm",
  },
  plugins: [
    {
      name: "island.is-resolve",
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

  external: [...builtinModules, ...builtinModules.map((e) => `node:${e}`), ...external],
};

export default config;
