import type { Workspace } from "../lib/workspace.js";
export interface Imports {
    main: string[];
    type: string[];
}
type TestFn = (workspace: Workspace, imports: Imports) => Record<string, string[]>;
type Tests = Partial<Record<Workspace["packageType"] | "default", TestFn>>;
export declare const tests: Tests;
export {};
