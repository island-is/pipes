import type { JSX, SpecifixJSX } from "./jsx.js";

export type IContainer = SpecifixJSX<"Container", null, JSX | JSX[] | null | string>;
export const Container = (
  props: Omit<IContainer, "type" | "children">,
  children: JSX | JSX[] | null | string,
): IContainer => {
  return {
    type: "Container",
    ...props,
    children,
  };
};
