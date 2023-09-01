import type { AnyElement, SpecifixJSX } from "./jsx.js";

export type CodeProps = {
  language?: string;
};
export type ICode = SpecifixJSX<"Code", CodeProps, AnyElement>;
export const Code = (props: Omit<ICode, "type">): ICode => {
  return {
    type: "Code",
    ...props,
  };
};
