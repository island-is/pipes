import { span } from "./css/span.js";
import { renderRow } from "./row.js";
import { renderSubtitle } from "./subtitle.js";

import type { SpecifixJSX } from "./jsx.js";

export type IError = SpecifixJSX<"Error", null, string>;
export const Error = (props: Omit<IError, "type" | "children">, children: string): IError => {
  return {
    type: "Error",
    ...props,
    children,
  };
};

export const renderError = {
  ansi:
    (render: (child: any, width: number) => string) =>
    (component: IError, width: number): string => {
      const errorTitle = span(
        renderSubtitle.ansi(render)(
          {
            type: "Subtitle",
            children: "  ❌ ERROR",
          },
          (width - 1) / 2,
        ),
        {
          margin: {
            left: 1,
          },
          color: "red",
          textAlign: "center",
          padding: {
            left: 4,
            right: 4,
          },
        },
      );

      const values = renderRow.ansi(render)(
        {
          type: "Row",
          width: [26],
          children: [
            errorTitle,
            span(
              render(component.children, width),
              {
                width: width / 2 - 1,
                fontStyle: "bold",
              },
              width / 2 - 1,
            ) as any,
          ],
        },
        width,
      );
      return span(
        values,
        {
          width: width,
          border: {
            top: true,
            bottom: true,
          },
        },
        width,
      ).join("");
    },

  markdown:
    (render: (child: any) => string) =>
    (component: IError): string => {
      return `**Error:** ${render(component.children)}`;
    },
};
