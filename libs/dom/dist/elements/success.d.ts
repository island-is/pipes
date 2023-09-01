import type { SpecifixJSX } from "./jsx.js";
export type ISuccess = SpecifixJSX<"Success", null, string>;
export declare const Success: (props: Omit<ISuccess, "type">, children: string) => ISuccess;
