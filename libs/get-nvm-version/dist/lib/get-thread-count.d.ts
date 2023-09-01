export declare const runWithLimitedConcurrency: <T extends (() => any)[]>(tasks: T, limit?: number) => Promise<Awaited<ReturnType<T[number]>>[]>;
