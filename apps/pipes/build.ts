import { rollup } from "rollup";
import { builtinModules } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";
import { swc } from "rollup-plugin-swc3";
import { preparePublishPackage } from "../../base/scripts/src/utils/publish.js";
import { z } from "./src/utils/zod/zod.js";

const currentPath = fileURLToPath(dirname(import.meta.url));
const packageJSON = JSON.parse(readFileSync(join(currentPath, "package.json"), "utf-8"));
const external = Object.keys({ ...packageJSON.dependencies, ...packageJSON.peerDependencies });

const createConfig = (input: string) => {
  const externalPackages = [...builtinModules, ...builtinModules.map((e) => `node:${e}`), ...external];
  return {
    input: input,
    plugins: [nodeResolve()],
    external(id) {
      return externalPackages.includes(id) || id.includes("node_modules");
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

const dtsConfig = (input: string) => {
  const baseConfig = createConfig(input);
  baseConfig.plugins = [...baseConfig.plugins, dts({ respectExternal: false })];
  return baseConfig;
};

const build = async (input: string, output: string, type: string) => {
  const dts = dtsConfig(input);
  const main = mainConfig(input, output);
  await Promise.all([
    (async () => {
      const bundle = await rollup(main);
      await bundle.write(main.output);
      await bundle.close();
    })(),
    (async () => {
      const bundle = await rollup(dts);
      await bundle.write({ file: type });
      await bundle.close();
    })(),
  ]);
};

const promises = [
  build("./src/pipes-core.tsx", "./dist/pipes-core.js", "./dist/pipes-core.d.ts"),
  build("./src/loader.mjs", "./dist/loader.mjs", "./dist/loader.d.ts"),
];

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
