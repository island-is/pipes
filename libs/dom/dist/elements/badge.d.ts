import type { SpecifixJSX } from "./jsx.js";
export type IBadge = SpecifixJSX<"Badge", null, string>;
export declare const Badge: (props: Omit<IBadge, "type">, children: string) => IBadge;
