export declare const reportError: (msg: string, task: string, projectName?: string | null, ms?: number) => void;
export declare const reportInfo: (msg: string, task: string, projectName?: string | null) => void;
export declare const reportSuccess: (msg: string, task: string, projectName?: string | null, ms?: number) => void;
export declare class Reporter {
    #private;
    constructor(name: string | null, task: string, enableTime?: boolean);
    info(_msg: string): void;
    error(msg: string): void;
    success(msg: string): void;
}
