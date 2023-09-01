import type { Workspace } from "./workspace.js";
type SWCError = {
    message: "Unknown error";
} | {
    message: string;
    line: number;
    character: number;
};
/**
 * @param project - Project
 * @returns - Record with problematic files or null if none
 */
export declare const compileWithSWC: (workspace: Workspace) => Promise<Record<string, SWCError> | null>;
export {};
