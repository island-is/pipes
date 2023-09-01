import type { withoutNever } from "./without-never.js";
export type StringLiteralKeys<T> = withoutNever<{
    [K in keyof T]: string extends K ? never : number extends K ? never : symbol extends K ? never : K;
}>;
export type OnlyStringLiteral<T> = withoutNever<{
    [K in keyof T]: string extends K ? never : number extends K ? never : symbol extends K ? never : T[K];
}>;
export type HaveSameKeys<T, U> = Exclude<StringLiteralKeys<T>, keyof U> extends never ? Exclude<StringLiteralKeys<U>, keyof T> extends never ? true : false : false;
