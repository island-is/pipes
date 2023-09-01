import type { zinfer } from "./zod.js";
declare const pipeWorkspace: import("zod").ZodDefault<import("zod").ZodObject<{
    changesGlobalLintHash: import("zod").ZodDefault<import("zod").ZodBoolean>;
    skipGlobalResolution: import("zod").ZodDefault<import("zod").ZodBoolean>;
    skipBuild: import("zod").ZodDefault<import("zod").ZodBoolean>;
    skipTest: import("zod").ZodDefault<import("zod").ZodBoolean>;
    skipLint: import("zod").ZodDefault<import("zod").ZodBoolean>;
}, "strip", import("zod").ZodTypeAny, {
    changesGlobalLintHash: boolean;
    skipGlobalResolution: boolean;
    skipBuild: boolean;
    skipTest: boolean;
    skipLint: boolean;
}, {
    changesGlobalLintHash?: boolean | undefined;
    skipGlobalResolution?: boolean | undefined;
    skipBuild?: boolean | undefined;
    skipTest?: boolean | undefined;
    skipLint?: boolean | undefined;
}>>;
export type WorkspaceConfig = zinfer<typeof pipeWorkspace>;
export declare const getWorkspaceConfig: (packageJSONRaw: any) => {
    changesGlobalLintHash: boolean;
    skipGlobalResolution: boolean;
    skipBuild: boolean;
    skipTest: boolean;
    skipLint: boolean;
};
export {};
