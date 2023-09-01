import { type Workspace } from "./lib/workspace.js";
export declare const runLintOnWorkspace: (workspace: Workspace) => Promise<(({
    filePath: string;
    success: boolean;
    error?: undefined;
} | {
    error: string;
    filePath: string;
    success?: undefined;
})[] | {
    error: string;
}[])[]>;
