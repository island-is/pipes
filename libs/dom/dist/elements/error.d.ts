import type { SpecifixJSX } from "./jsx.js";
export type IError = SpecifixJSX<"Error", null, string>;
export declare const Error: (props: Omit<IError, "type">, children: string) => IError;
