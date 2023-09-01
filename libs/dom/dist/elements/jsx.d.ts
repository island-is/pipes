import type { CSS } from "./css/types.js";
import type { Simplify } from "./simplify.js";
export type JSX = {
    type: string;
    children: AnyElement[] | AnyElement;
    props?: Record<string, any>;
};
export type AnyElement = JSX | string | null;
export type SpecifixJSX<type extends string, props extends Record<string, any> | null, children extends (JSX | string | null)[] | null | string | JSX> = Simplify<props extends null ? {
    type: type;
    style?: CSS;
    renderAS?: "ansi" | "markdown";
} & {
    children: children;
} : {
    type: type;
    style?: CSS;
    renderAS?: "ansi" | "markdown";
} & props & {
    children: children;
}>;
