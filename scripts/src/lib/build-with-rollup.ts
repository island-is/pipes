import { join } from "node:path";

import { rollup } from "rollup";
import dts from "rollup-plugin-dts";
import { swc } from "rollup-plugin-swc3";

import type { Workspace } from "./workspace.js";

export type RollupResult = {
  type: "Rollup";
  status: "Success" | "Error";
  workspace: string;
} & (
  | {
      status: "Error";
      error: {
        message: "Unknown error";
        detail?: unknown;
      };
    }
  | {
      status: "Success";
    }
);

export async function buildWithRollup(workspace: Workspace): Promise<RollupResult> {
  try {
    const input = await import(join(workspace.path, "rollup.config.js"));
    const config = input.default;
    const buildJS = async () => {
      const newConfig = { ...config };
      newConfig.output = {
        sourcemap: true,
        file: input.files.output,
        format: "esm",
      };
      newConfig.plugins = [...newConfig.plugins, swc({ minify: false })];
      const bundle = await rollup(newConfig);
      await bundle.write(config.output);
      await bundle.close();
    };
    const buildType = async () => {
      const newConfig = { ...config };
      delete newConfig.output;
      newConfig.plugins = [...newConfig.plugins, dts({ respectExternal: true })];
      const bundle = await rollup(newConfig);
      await bundle.write({ file: input.files.types });
      await bundle.close();
    };
    await Promise.all([buildType(), buildJS()]);
    return {
      type: "Rollup",
      workspace: workspace.name,
      status: "Success",
    };
  } catch (e) {
    console.log(e);
    return {
      type: "Rollup",
      workspace: workspace.name,
      status: "Error",
      error: {
        message: "Unknown error",
        detail: e,
      },
    };
  }
}
