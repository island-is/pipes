interface TypescriptError {
    line: number;
    character: number;
    message: string;
}
export declare const compileTypescript: (tsconfig: string, dist: string | null) => Record<string, TypescriptError> | null;
export {};
