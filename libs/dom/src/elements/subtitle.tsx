import type { SpecifixJSX } from "./jsx.js";

export type ISubtitle = SpecifixJSX<"Subtitle", null, string>;
export const Subtitle = (props: Omit<ISubtitle, "type">, children: string): ISubtitle => {
  return {
    type: "Subtitle",
    ...props,
    children,
  };
};
