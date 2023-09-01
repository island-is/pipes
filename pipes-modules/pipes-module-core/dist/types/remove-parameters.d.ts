export type removeParameters<fn extends (...args: any[]) => any> = fn extends (arg1: any, arg2: any, ...args: infer P) => infer R ? (...args: P) => R : never;
