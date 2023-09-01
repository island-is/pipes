import type { AnyElement, JSX, SpecifixJSX } from "./jsx.js";

export type IRow = SpecifixJSX<"Row", null, AnyElement | AnyElement[] | null | string>;
export const Row = (props: Omit<IRow, "type" | "children">, children: JSX | JSX[] | null | string): IRow => {
  return {
    type: "Row",
    ...props,
    children,
  };
};
