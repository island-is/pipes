export declare function timeFunction<T extends (..._args: any[]) => any>(fn: T, name?: string): (...args: Parameters<T>) => {
    timeStarted: Date;
    timeEnded: Date;
    duration: number;
    value: ReturnType<T>;
    name?: string | undefined;
};
