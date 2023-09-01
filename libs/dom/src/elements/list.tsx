import type { AnyElement, SpecifixJSX } from "./jsx.js";

export type IList = SpecifixJSX<"List", null, AnyElement[] | AnyElement | null>;
export type IListItem = SpecifixJSX<"ListItem", null, string>;
export const List = (props: Omit<IList, "type" | "children">, children: IListItem[] = []): IList => {
  return {
    type: "List",
    ...props,
    children,
  };
};

export const ListItem = (props: Omit<IListItem, "type">, children: string): IListItem => {
  return {
    type: "ListItem",
    ...props,
    children,
  };
};
