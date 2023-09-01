import type { SpecifixJSX } from "./jsx.js";

export type ILink = SpecifixJSX<"Link", { href: string }, string>;
export const Link = (props: Omit<ILink, "type">, children: string): ILink => {
  return {
    type: "Link",
    ...props,
    children,
  };
};
