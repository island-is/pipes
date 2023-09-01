import type { Workspace } from "./workspace.js";
type SWCError = {
    message: "Unknown error";
} | {
    message: string;
    line: number;
    character: number;
};
export declare const compileWithSWC: (workspace: Workspace) => Promise<Record<string, SWCError> | null>;
export {};
