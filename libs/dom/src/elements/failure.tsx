import { span } from "./css/span.js";

import type { SpecifixJSX } from "./jsx.js";

export type IFailure = SpecifixJSX<"Failure", null, string>;
export const Failure = (props: Omit<IFailure, "type" | "children">, children: string): IFailure => {
  return {
    type: "Failure",
    ...props,
    children,
  };
};

export const renderFailure = {
  ansi:
    (render: (child: any, width: number) => string) =>
    (component: IFailure, width: number): string => {
      return span(`❌ ${render(component.children, width)}`, {
        width,
        color: "red",
        height: 1,
      }).join("");
    },

  markdown:
    (render: (child: any) => string) =>
    (component: IFailure): string => {
      return `❌ ${render(component.children)}`;
    },
};
