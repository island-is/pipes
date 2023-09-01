import { builtinModules } from "node:module";
import { basename, join } from "path";

import { type removeContextCommand, tmpFile } from "@island-is/pipes-core";
import { rollup } from "rollup";
import { swc } from "rollup-plugin-swc3";

import type { PipesNodeModule } from "../interface.js";
import type { Container } from "@dagger.io/dagger";

export const compileAndRun: removeContextCommand<PipesNodeModule["Context"]["Implement"]["nodeCompileAndRun"]> =
  async function compileAndRun(context, config, { container, name, file, external, output = { output: "stdout" } }) {
    let value: Container;
    const getMessage = async (messageContainer: Container) => {
      if (!messageContainer) {
        throw new Error("Container unassigned");
      }
      if ("output" in output) {
        if (output.output === "stdout") {
          return messageContainer.stdout();
        }
        if (output.output === "stderr") {
          return messageContainer.stderr();
        }
      }
      if ("file" in output) {
        const outputFile = (await messageContainer.file(output.file).sync()).contents();
        return outputFile;
      }
      if ("fileFromEnv" in output) {
        const fileName = await messageContainer.envVariable(output.fileFromEnv);
        const outputFile = await (await messageContainer.file(fileName).sync()).contents();
        return outputFile;
      }
      // Default behaviour
      return messageContainer.stdout();
    };
    try {
      const tmpFile = await compileFile(file, external, name);
      const imageStore = await context.imageStore;
      value = await (container ?? imageStore.awaitForAvailability(`node-${config.nodeImageKey}`));
      const tmpFileRef = context.client.host().file(tmpFile);
      value = await (
        await value
          .withWorkdir(config.nodeWorkDir)
          .withFile(join(config.nodeWorkDir, basename(tmpFile)), tmpFileRef)
          .withExec(["yarn", "node", basename(tmpFile)])
          .sync()
      )
        .withExec(["rm", basename(tmpFile)])
        .sync();
      return {
        message: await getMessage(value),
        container: value,
      };
    } catch (e) {
      const message = await (() => {
        try {
          /* @ts-expect-error - this could been unassigned */
          return getMessage(value);
        } catch {
          return `Error occured with ${file} using prefix: ${name}`;
        }
      })();
      return {
        error: e,
        message,
        container: null,
      };
    }
  };

const nodeResolve = (await import("rollup-plugin-node-resolve")).default;

async function compileFile(inputFile: string, additionalExternals: string[] = [], name: string): Promise<string> {
  await using tmp = await tmpFile({ prefix: name, postfix: ".mjs" });
  const tmpFilePath = tmp.path;
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
