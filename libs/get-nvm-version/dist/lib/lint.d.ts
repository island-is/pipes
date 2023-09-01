import type { Workspace } from "./workspace.js";
export declare const runESLint: (workspace: Workspace) => Promise<({
    filePath: string;
    success: boolean;
    error?: undefined;
} | {
    error: string;
    filePath: string;
    success?: undefined;
})[]>;
