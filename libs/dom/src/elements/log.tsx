import type { SpecifixJSX } from "./jsx.js";

export type ILog = SpecifixJSX<"Log", null, string>;
export const Log = (props: Omit<ILog, "type">, children: string): ILog => {
  return {
    type: "Log",
    ...props,
    children,
  };
};
