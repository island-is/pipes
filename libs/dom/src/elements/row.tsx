import { escapeAnsi } from "./css/ansi-escape.js";
import { span } from "./css/span.js";

import type { IBadge } from "./badge.js";
import type { AnyElement, SpecifixJSX } from "./jsx.js";
import type { PipeComponents } from "./pipe-components.js";

export type IRow = SpecifixJSX<
  "Row",
  { width?: (number | undefined)[] | undefined },
  AnyElement | AnyElement[] | null | string
>;
export const Row = (props: Omit<IRow, "type" | "children">, children: PipeComponents | PipeComponents[]): IRow => {
  return {
    type: "Row",
    ...props,
    children: children as any,
  };
};

export const renderRow = {
  ansi:
    (render: (component: PipeComponents | null, width: number) => string) =>
    (component: IRow, width: number): string => {
      const widthChild = component.width ?? [];
      const computedChild = Math.floor(width - (widthChild.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0));
      console.log({ width, computedChild });
      if ("children" in component) {
        if (Array.isArray(component.children)) {
          const widthPerChild =
            component.children.length - widthChild.length > 0
              ? Math.floor((computedChild - 2) / (component.children.length - widthChild.length))
              : 0;
          const css = {
            width: widthPerChild,
            padding: {
              left: 2,
            },
            margin: {
              top: 0,
              bottom: 0,
              left: 1,
              right: 1,
            },
          };

          let children = component.children.map((value, index) => {
            const currentWidth = widthChild[index] ?? widthPerChild;
            const newCss = {
              ...css,
              width: currentWidth,
            };
            return span(render(value as any, currentWidth), newCss);
          });

          const maxArrLength = children.reduce((a, b) => {
            return Math.max(b.length, a);
          }, 0);
          const fillArr = Array(maxArrLength).fill(" ".repeat(widthPerChild));
          children = children.map((e, index) => {
            if (typeof widthChild[index] === "number") {
              const childFillArr = Array(maxArrLength).fill(" ".repeat(widthChild[index] as number));
              return [...e, ...childFillArr].slice(0, maxArrLength);
            }
            return [...e, ...fillArr].slice(0, maxArrLength);
          });
          const lineCounts = children.map((e) => e.length);
          const stringLength = children.map((e) => e.map((x) => escapeAnsi(x).length));
          console.log(lineCounts, stringLength, widthPerChild, children);
          /* children = children.map((e, index) => {
            const currentWidth = widthChild[index] ?? widthPerChild;
            return span(e.join(""), {
              width: currentWidth,
              border: {
                right: true,
                color: "gray" as const,
              },
            });
          }); */

          let str = "";
          for (let y = 0; y < maxArrLength; y++) {
            for (let z = 0; z < children.length; z++) {
              str += children[z][y];
              console.log({ str });
            }
          }
          return str;
        } else {
          return span(render(component.children as any, width), {
            width: width,
          }).join("");
        }
      } else {
        return "";
      }
    },
  markdown:
    (_render: (component: PipeComponents | null, width: number) => string) =>
    (_component: IBadge): string => {
      throw new Error("Not implemented");
    },
};
