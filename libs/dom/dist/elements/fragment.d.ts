import type { AnyElement, SpecifixJSX } from "./jsx.js";
export type IFragment = SpecifixJSX<"Fragment", null, AnyElement[]>;
export declare const Fragment: (props: Omit<IFragment, "type">, ...children: AnyElement[]) => IFragment;
