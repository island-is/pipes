import type { SpecifixJSX } from "./jsx.js";

export type ITitle = SpecifixJSX<"Title", null, string>;
export const Title = (props: Omit<ITitle, "type">, children: string): ITitle => {
  return {
    type: "Title",
    ...props,
    children,
  };
};
