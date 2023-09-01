export declare class PipesError<T extends (...value: any[]) => any> extends Error {
    #private;
    constructor({ parameters, duration, message, error, }: {
        parameters: Parameters<T>;
        message?: string;
        duration: number;
        error?: unknown;
    });
    getPipesError(): {
        message: string;
        error: string | undefined;
        duration: number;
        parameters: Parameters<T> | undefined;
    };
}
