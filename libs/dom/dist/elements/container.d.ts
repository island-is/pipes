import type { JSX, SpecifixJSX } from "./jsx.js";
export type IContainer = SpecifixJSX<"Container", null, JSX | JSX[] | null | string>;
export declare const Container: (props: Omit<IContainer, "type" | "children">, children: JSX | JSX[] | null | string) => IContainer;
