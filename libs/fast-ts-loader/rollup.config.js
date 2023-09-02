import { swc } from "rollup-plugin-swc3";
import { builtinModules } from "node:module";

const config = {
  input: "src/index.ts",
  output: {
    file: "dist/pipes-loader.js",
    format: "esm",
  },
  plugins: [swc({ minify: false })],
  external: [...builtinModules.map((e) => `node:${e}`), "@swc/core", "glob"],
};

export default config;
