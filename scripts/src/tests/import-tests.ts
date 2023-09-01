/**
 * This is a test for all dependencies in Pipes.
 */

import type { ImportResult } from "../lib/error-messages.js";
import type { Workspace } from "../lib/workspace.js";

export interface Imports {
  main: string[];
  type: string[];
}

type TestFn = (workspace: Workspace, imports: Imports) => ImportResult[];
type Tests = Partial<Record<Workspace["packageType"] | "default", TestFn>>;
export const tests: Tests = {
  libs: (workspace, imports) => {
    const typeImportShouldBeInDevDependencies = imports.type.filter(
      (value) => !workspace.dependencies.peerDependencies.includes(value),
    );
    const importShouldBeInDevAndPeer = imports.main.filter(
      (value) =>
        !workspace.dependencies.peerDependencies.includes(value) ||
        !workspace.dependencies.devDependencies.includes(value),
    );
    const results: ImportResult[] = [];
    typeImportShouldBeInDevDependencies.forEach((e) => {
      results.push({
        type: "Import" as const,
        workspace: workspace.name,
        status: "Error" as const,
        error: {
          message: "Type should be in dev dependencies",
          package: e,
        },
      });
    });
    importShouldBeInDevAndPeer.forEach((e) => {
      results.push({
        type: "Import" as const,
        workspace: workspace.name,
        status: "Error" as const,
        error: {
          message: "Packages should be in dev and peer dependencies.",
          package: e,
        },
      });
    });
    if (results.length === 0) {
      results.push({
        type: "Import",
        status: "Success",
        workspace: workspace.name,
      });
    }
    return results;
  },
  default: (_workspace, _imports) => {
    return [];
  },
};
