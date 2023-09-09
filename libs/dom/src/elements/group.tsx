import type { AnyElement, SpecifixJSX } from "./jsx.js";

export type IGroup = SpecifixJSX<"Group", { title: string }, any | any[]>;
export const Group = (props: Omit<IGroup, "type" | "children">, ...children: AnyElement[]): IGroup => {
  return {
    type: "Group",
    ...props,
    children,
  };
};
