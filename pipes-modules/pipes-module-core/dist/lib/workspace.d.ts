import type { WorkspaceConfig } from "./pipe-workspace-config.js";
export interface Workspace {
    name: string;
    config: WorkspaceConfig;
    packageType: "libs" | "scripts" | "pipes-modules" | "base" | "apps";
    dependencies: {
        dependencies: string[];
        devDependencies: string[];
        peerDependencies: string[];
    };
    rawPackageJSON: any;
    path: string;
    tsconfig: {
        test: string;
        build: string;
    };
    lint: {
        eslint: string;
        prettier: string;
    };
    sourceDirectory: string;
    distDirectory: string;
    testDirectory: string;
    files: {
        source: {
            main: string[];
            test: string[];
        };
        dist: string | null;
    };
}
export declare const getWorkspaceByDirectory: (directory?: string) => Promise<Workspace>;
