import { span } from "./css/span.js";

import type { SpecifixJSX } from "./jsx.js";

export type ISuccess = SpecifixJSX<"Success", null, string>;
export const Success = (props: Omit<ISuccess, "type" | "children">, children: string): ISuccess => {
  return {
    type: "Success",
    ...props,
    children,
  };
};

export const renderSuccess = {
  ansi:
    (render: (child: any, width: number) => string) =>
    (component: ISuccess, width: number): string => {
      return span(`✅ ${render(component.children, width)}`, {
        width,
        color: "green",
        height: 1,
      }).join("");
    },

  markdown:
    (render: (child: any) => string) =>
    (component: ISuccess): string => {
      return `✅ ${render(component.children)}`;
    },
};
