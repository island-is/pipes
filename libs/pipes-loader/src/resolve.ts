import { builtinModules } from "node:module";
import { pathToFileURL } from "node:url";

import { localProjects, localScope, should_use_source_extension_for_local_packages } from "./const.js";
import { convertFilePath } from "./libs/convert-file-path.js";
import { convertURLToDirectory } from "./libs/convert-url-to-directory.js";
import { doesFileExists } from "./libs/does-file-exist.js";
import { isDirectory } from "./libs/is-directory.js";
import { shouldCompile } from "./libs/should-compile.js";

export interface ResolveContext {
  parentURL?: string | undefined;
}

export type ResolveFn = (
  url: string,
  context: ResolveContext,
  nextResolve: ResolveFn,
) => Promise<{
  url: string;
  shortCircuit: boolean;
}>;

export const resolve: ResolveFn = async (url, context, nextResolve) => {
  /** Ignore builtin modules. */
  if (url.startsWith("node:") || builtinModules.includes(url)) {
    return nextResolve(url, context, nextResolve);
  }
  /** If we are in source mode and this is a local package - fetch it! */
  if (should_use_source_extension_for_local_packages && url.startsWith(localScope)) {
    const obj = localProjects[url];
    if (obj) {
      return {
        url: pathToFileURL(obj.source).href,
        shortCircuit: true,
      };
    }
  }
  /**
   * 1. parentURL
   * Check if parentURL is defined || Set process.cwd() as parentURL
   * Convert parentURL from URL to string - if needed
   * Check if parentURL is file or directory - use dirname if file
   * 2. filePath
   * Convert filePath from URL to string - if needed
   * Join with parentURL if it is a relative path.
   */
  const parentURL = await convertURLToDirectory(context?.parentURL);
  const filePath = convertFilePath(url, parentURL);

  /**
   * Compile if:
   * a) the file exists and has a .ts .tsx ending
   * b) the file does not exist but a file with .ts .tsx ending does
   */
  const compileFile = await shouldCompile(filePath);

  /** Ignore files who do not meet those conditions */
  if (!compileFile && (await doesFileExists(filePath))) {
    const fileIsDirectory = await isDirectory(filePath);
    if (!fileIsDirectory) {
      return nextResolve(url, context, nextResolve);
    }
    return nextResolve(url, context, nextResolve);
  }

  if (!compileFile) {
    return nextResolve(url, context, nextResolve);
  }

  /** Tell nodejs to compile! */
  return {
    url: pathToFileURL(compileFile).href,
    shortCircuit: true,
  };
};
