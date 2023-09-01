interface TypescriptError {
    line: number;
    character: number;
    message: string;
}
/**
 * @param tsconfig - path to tsconfig
 * @param - path to dist, null if only used to check
 * @returns  - Record of files with problems - null if successful
 */
export declare const compileTypescript: (tsconfig: string, dist: string | null) => Record<string, TypescriptError> | null;
export {};
