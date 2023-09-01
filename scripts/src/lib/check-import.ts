import { readFile } from "node:fs/promises";

import { isBuiltinModule } from "./is-builtin-module.js";

import type { Workspace } from "./workspace.js";
import type { Imports } from "../tests/import-tests.js";

/**
 * @param workspace {Workspace} - workspace
 * @returns
 */
export const getImports = async (workspace: Workspace): Promise<Imports> => {
  const imports = new Set<string>();
  const typeImports = new Set<string>();
  await Promise.all(
    workspace.files.source.main.map(async (e) => {
      const content = await readFile(e, "utf-8");
      helper(/import\s+type\s+.*from\s+['"]([^'"]+)['"];/g, typeImports, content);
      helper(/import\s+(?!type\s+).*from\s+['"]([^'"]+)['"];/g, imports, content);
    }),
  );
  return {
    main: Array.from(imports),
    type: Array.from(typeImports).filter((e) => !imports.has(e)),
  };
};

function helper(regex: RegExp, setArr: Set<string>, content: string) {
  let match;
  while ((match = regex.exec(content))) {
    const module = match[1];
    if (!module.startsWith("node:") && isBuiltinModule(module)) {
      throw new Error(`Import of built-in module ${module} should start with 'node:'`);
    } else if (!module.startsWith(".") && !module.startsWith("node:") && !isBuiltinModule(module)) {
      setArr.add(module);
    }
  }
}
