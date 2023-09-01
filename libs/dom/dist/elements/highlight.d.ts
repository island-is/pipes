import type { SpecifixJSX } from "./jsx.js";
export type IHighlight = SpecifixJSX<"Highlight", null, string>;
export declare const Highlight: (props: Omit<IHighlight, "type" | "children">, children: string) => IHighlight;
