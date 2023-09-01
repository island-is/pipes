export type combineNullUndefined<T> = T extends null | undefined ? null : T;
