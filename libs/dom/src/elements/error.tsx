import type { SpecifixJSX } from "./jsx.js";

export type IError = SpecifixJSX<"Error", null, string>;
export const Error = (props: Omit<IError, "type" | "children">, children: string): IError => {
  return {
    type: "Error",
    ...props,
    children,
  };
};
