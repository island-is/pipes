import type { AnyElement, SpecifixJSX } from "./jsx.js";

export type IFragment = SpecifixJSX<"Fragment", null, AnyElement[]>;
export const Fragment = (props: Omit<IFragment, "type">, ...children: AnyElement[]): IFragment => {
  return {
    type: "Fragment",
    ...props,
    children,
  };
};
