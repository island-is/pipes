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
    const typeImportShouldBeInDevDependencies = imports.type
      .filter((value) => value !== "@island-is/ink")
      .filter((value) => value !== "jest-snapshot")
      .filter((value) => !value.startsWith("date-fns"))
      .filter((value) => !workspace.dependencies.peerDependencies.includes(value))
      .filter((e) => {
        const x = e.split("/");

        for (let i = x.length - 1; i > -1; i--) {
          const value = x.reduce((a, b, index) => {
            if (index === 0) {
              return b;
            }
            if (index === i) {
              return a;
            }
            return `${a}/${b}`;
          }, "");
          if (workspace.dependencies.peerDependencies.includes(value)) {
            return false;
          }
        }
        return true;
      });

    const importShouldBeInDevAndPeer = imports.main
      .filter((value) => value !== "@island-is/ink")
      .filter((value) => value !== "jest-snapshot")
      .filter((value) => !value.startsWith("date-fns"))
      .filter(
        (value) =>
          !workspace.dependencies.peerDependencies.includes(value) ||
          !workspace.dependencies.devDependencies.includes(value),
      )
      .filter((e) => {
        const x = e.split("/");

        for (let i = x.length - 1; i > -1; i--) {
          const value = x.reduce((a, b, index) => {
            if (index === 0) {
              return b;
            }
            if (index === i) {
              return a;
            }
            return `${a}/${b}`;
          }, "");
          if (
            workspace.dependencies.peerDependencies.includes(value) &&
            workspace.dependencies.peerDependencies.includes(value)
          ) {
            return false;
          }
        }
        return true;
      });
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
