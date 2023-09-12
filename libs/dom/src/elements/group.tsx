import ciinfo from "ci-info";

import { Command } from "../github-command.js";

import type { AnyElement, SpecifixJSX } from "./jsx.js";

export type IGroup = SpecifixJSX<"Group", { title: string }, any | any[]>;
export const Group = (props: Omit<IGroup, "type" | "children">, ...children: AnyElement[]): IGroup => {
  return {
    type: "Group",
    ...props,
    children,
  };
};

export const renderGroup = {
  ansi:
    (render: (children: any, width: number) => string) =>
    (component: IGroup, width: number): string => {
      const content = render(component.children, width);

      if (ciinfo.GITHUB_ACTIONS) {
        const startGroup = new Command("group", {}, component.title).toString();
        const endGroup = new Command("endgroup", {}, "").toString();
        return `\n${startGroup}\n${content}\n${endGroup}`;
      }

      return content;
    },
  markdown:
    (_render: (children: any, _width: number) => string) =>
    (_component: IGroup, _width: number): string => {
      // You can implement markdown specific rendering logic here if needed
      return "";
    },
};
