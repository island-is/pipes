import type { SpecifixJSX } from "./jsx.js";

export type IBadge = SpecifixJSX<"Badge", null, string>;
export const Badge = (props: Omit<IBadge, "type">, children: string): IBadge => {
  return {
    type: "Badge",
    ...props,
    children,
  };
};
