import type { SpecifixJSX } from "./jsx.js";

export type IHighlight = SpecifixJSX<"Highlight", null, string>;
export const Highlight = (props: Omit<IHighlight, "type" | "children">, children: string): IHighlight => {
  return {
    type: "Highlight",
    ...props,
    children,
  };
};
