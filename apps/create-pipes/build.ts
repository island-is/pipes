import { rollup } from "rollup";
import { builtinModules } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { swc } from "rollup-plugin-swc3";
import { preparePublishPackage } from "../../base/scripts/src/utils/publish.js";
import { z } from "@island-is/pipes-core";

const currentPath = fileURLToPath(dirname(import.meta.url));
const packageJSON = JSON.parse(readFileSync(join(currentPath, "package.json"), "utf-8"));
const external = Object.keys({ ...packageJSON.dependencies, ...packageJSON.peerDependencies });

const createConfig = (input: string) => {
  const externalPackages = [...builtinModules, ...builtinModules.map((e) => `node:${e}`), ...external];
  return {
    input: input,
    plugins: [nodeResolve()],
    external(id) {
      return externalPackages.includes(id);
    },
  };
};
const mainConfig = (input: string, output: string) => {
  const baseConfig = createConfig(input);
  (baseConfig as any).output = {
    sourcemap: true,
    file: output,
    format: "esm",
  };
  baseConfig.plugins = [
    ...baseConfig.plugins,
    swc({
      sourceMaps: true,
      minify: false,
    }),
  ];
  return baseConfig as typeof baseConfig & { output: { sourcemap: true; file: string; format: "commonjs" | "module" } };
};

const build = async (input: string, output: string) => {
  const main = mainConfig(input, output);
  await Promise.all([
    (async () => {
      const bundle = await rollup(main);
      await bundle.write(main.output);
      await bundle.close();
    })(),
  ]);
};

const promises = [build(join(currentPath, "src", "create-pipes.ts"), join(currentPath, "dist", "create-pipes.js"))];

const version = z
  .string()
  .default(packageJSON.version, {
    env: "VERSION",
    arg: {
      long: "version",
      short: "v",
    },
  })
  .parse(undefined);

await Promise.all(promises);
await preparePublishPackage(process.cwd(), version);