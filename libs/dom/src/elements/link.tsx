import terminalLink from "terminal-link";

import type { SpecifixJSX } from "./jsx.js";

export type ILink = SpecifixJSX<"Link", { href: string }, string>;
export const Link = (props: Omit<ILink, "type" | "children">, children: string): ILink => {
  return {
    type: "Link",
    ...props,
    children,
  };
};

export const renderLink = {
  ansi:
    (render: (child: any, width: number) => string) =>
    (component: ILink, width: number): string => {
      return terminalLink(render(component.children, width), component.href);
    },

  markdown:
    (render: (child: any) => string) =>
    (component: ILink): string => {
      return `[${render(component.children)}](${component.href})`;
    },
};
