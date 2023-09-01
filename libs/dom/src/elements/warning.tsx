import type { SpecifixJSX } from "./jsx.js";

export type IWarning = SpecifixJSX<"Warning", null, string>;
export const Warning = (props: Omit<IWarning, "type" | "children">, children: string): IWarning => {
  return {
    type: "Warning",
    ...props,
    children,
  };
};
