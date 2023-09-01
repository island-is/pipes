export type addParameters<fn extends (...args: any[]) => any, context, config> = fn extends (...args: infer P) => infer R ? (context: context, config: config, ...args: P) => R : never;
