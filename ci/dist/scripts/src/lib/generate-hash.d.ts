import type { Workspace } from "./workspace.js";
type BuildOrder = Workspace[][];
export type workspaceWithHashes = Workspace & {
    hash: {
        build?: string;
        lint?: string;
        test?: string;
    };
};
export declare const generateHashesFromBuild: (build: BuildOrder) => Promise<workspaceWithHashes[]>;
export declare function generateWorkspaceHashes(workspace: Workspace, extraHash?: string | null): Promise<{
    build?: string;
    test?: string;
    lint?: string;
}>;
export {};
