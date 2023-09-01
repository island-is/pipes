import type { SpecifixJSX } from "./jsx.js";
export type IInfo = SpecifixJSX<"Info", null, string>;
export declare const Info: (props: Omit<IInfo, "type">, children: string) => IInfo;
