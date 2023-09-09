import type { SpecifixJSX } from "./jsx.js";

export type IInfo = SpecifixJSX<"Info", null, string>;
export const Info = (props: Omit<IInfo, "type" | "children">, children: string): IInfo => {
  return {
    type: "Info",
    ...props,
    children,
  };
};
