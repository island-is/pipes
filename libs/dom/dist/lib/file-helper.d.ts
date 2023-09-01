export declare const emptyDirectory: (dir: string) => Promise<void>;
export declare const listFilteredFiles: (dir: string) => Promise<{
    build: string[];
    test: string[];
}>;
