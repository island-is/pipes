import type { SpecifixJSX } from "./jsx.js";

export type ISuccess = SpecifixJSX<"Success", null, string>;
export const Success = (props: Omit<ISuccess, "type" | "children">, children: string): ISuccess => {
  return {
    type: "Success",
    ...props,
    children,
  };
};
