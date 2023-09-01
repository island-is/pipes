import type { Workspace } from "./workspace.js";
import type { Imports } from "../tests/import-tests.js";
/**
 * @param workspace {Workspace} - workspace
 * @returns
 */
export declare const getImports: (workspace: Workspace) => Promise<Imports>;
