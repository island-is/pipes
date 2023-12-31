import { builtinModules } from "node:module";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";

import { transformFile } from "@swc/core";

import { allowed_extension, allowed_other_extensions } from "./const.js";
import { fs } from "./libs/fs.js";
import { getPackageType } from "./libs/get-package-type.js";

export interface LoadContext {
  parentURL?: string | undefined;
}

export type LoadFn = (
  url: string,
  context: LoadContext,
  nextLoad: LoadFn,
) => Promise<{
  source?: string | Buffer | null | undefined;
  shortCircuit: boolean;
  format?: "commonjs" | "module";
}>;

export const load: LoadFn = async (url, context, defaultLoad) => {
  if (builtinModules.includes(url) || url.startsWith("node")) {
    return defaultLoad(url, context, defaultLoad);
  }
  if (!allowed_extension.includes(extname(url)) && allowed_other_extensions.includes(extname(url))) {
    return defaultLoad(url, context, defaultLoad);
  }
  if (!allowed_extension.includes(extname(url))) {
    const filePath = fileURLToPath(url);
    const moduleType = await getPackageType(filePath);
    return {
      source: await fs.readFile(filePath),
      format: moduleType,
      shortCircuit: true,
    };
  }
  const moduleType = await getPackageType(fileURLToPath(url));
  /** Transpile all code that ends with ts or tsx */
  const { code } = await transformFile(fileURLToPath(url), {
    root: process.cwd(),
    cwd: process.cwd(),
    swcrc: false,
    jsc: {
      target: "esnext",
      parser: {
        syntax: "typescript",
        dynamicImport: true,
      },
      transform: {
        react: {
          pragma: "React.createElement",
          pragmaFrag: "React.Fragment",
          throwIfNamespace: true,
          development: false,
          useBuiltins: false,
        },
      },
    },
    sourceMaps: "inline",
    module: {
      type: moduleType === "commonjs" ? "commonjs" : "nodenext",
    },
  });

  return {
    format: moduleType,
    shortCircuit: true,
    source: code,
  };
};
