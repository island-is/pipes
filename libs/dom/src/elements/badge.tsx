import { span } from "./css/span.js";

import type { SpecifixJSX } from "./jsx.js";
import type { PipeComponents } from "./pipe-components.js";

export type IBadge = SpecifixJSX<"Badge", null, string>;
export const Badge = (props: Omit<IBadge, "type" | "children">, children: string): IBadge => {
  return {
    type: "Badge",
    ...props,
    children,
  };
};

export const renderBadge = {
  ansi:
    (render: (component: PipeComponents | null, width: number) => string) =>
    (component: IBadge): string => {
      const child = span(render(component.children, 1), {
        width: 1,
        height: 1,
        showTruncation: false,
      })[0].trim();
      return span(`[${child}]`, {
        width: 5,
        showTruncation: false,
        height: 1,
        padding: {
          left: 1,
          right: 1,
        },
      }).join("");
    },
  markdown:
    (_render: (component: PipeComponents | null, width: number) => string) =>
    (_component: IBadge): string => {
      throw new Error("Not implemented");
    },
};
