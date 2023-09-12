import { span } from "./css/span.js";

import type { SpecifixJSX } from "./jsx.js";

export type ISubtitle = SpecifixJSX<"Subtitle", null, string>;
export const Subtitle = (props: Omit<ISubtitle, "type" | "children">, children: string): ISubtitle => {
  return {
    type: "Subtitle",
    ...props,
    children,
  };
};

export const renderSubtitle = {
  ansi:
    (render: (child: any, width: number) => string) =>
    (component: ISubtitle, width: number): string => {
      return span(`=== ${render(component.children, width)} ===`, {
        fontStyle: "bold underline",
      }).join("");
    },

  markdown:
    (render: (child: any) => string) =>
    (component: ISubtitle): string => {
      return `## ${render(component.children)}`;
    },
};
