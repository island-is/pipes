import type { SpecifixJSX } from "./jsx.js";
export type ILink = SpecifixJSX<"Link", {
    href: string;
}, string>;
export declare const Link: (props: Omit<ILink, "type">, children: string) => ILink;
