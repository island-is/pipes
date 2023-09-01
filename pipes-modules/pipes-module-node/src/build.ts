import { builtinModules } from "node:module";

import { rollup } from "rollup";
import { swc } from "rollup-plugin-swc3";
import { file as tmpFile } from "tmp-promise";

const nodeResolve = (await import("rollup-plugin-node-resolve")).default;

export async function compileFile(
  inputFile: string,
  additionalExternals: string[] = [],
  name: string,
): Promise<string> {
  const { path: tmpFilePath } = await tmpFile({ prefix: name, postfix: ".mjs" });

  const config = {
    input: inputFile,
    output: {
      file: tmpFilePath,
      format: "esm" as const,
    },
    // @ts-expect-error - wrong typing
    plugins: [nodeResolve({ only: [] }), swc({ minify: false })],
    external: [...builtinModules, ...builtinModules.map((e) => `node:${e}`), ...additionalExternals],
  };

  const bundle = await rollup(config);

  await bundle.write(config.output);
  await bundle.close();

  return tmpFilePath;
}
