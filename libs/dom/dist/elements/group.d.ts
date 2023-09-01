import type { AnyElement, SpecifixJSX } from "./jsx.js";
export type IGroup = SpecifixJSX<"Group", {
    title: string;
}, any | any[]>;
export declare const Group: (props: Omit<IGroup, "type">, ...children: AnyElement[]) => IGroup;
