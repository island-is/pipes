import type { SpecifixJSX } from "./jsx.js";
export type IFailure = SpecifixJSX<"Failure", null, string>;
export declare const Failure: (props: Omit<IFailure, "type">, children: string) => IFailure;
