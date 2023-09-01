export type isTuple<T> = T extends [infer _X, ...infer _XS] ? true : false;
