/**
 * @file To run few tasks at once
 */
/**
 * @param {(() => any)[]} tasks - hehe
 * @param {number} limit - limits
 * @returns {Promise<any[]>} - returns every value
 */
export declare const runWithLimitedConcurrency: <T extends (() => any)[]>(tasks: T, limit?: number) => Promise<Awaited<ReturnType<T[number]>>[]>;
