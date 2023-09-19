/* eslint-disable @typescript-eslint/no-use-before-define */

import { Box, Text, useWidthContext } from "@island-is/ink";
import * as React from "react";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

type Color = Parameters<typeof Box>[0]["borderColor"];
type Width = Parameters<typeof Box>[0]["width"];
export type IRow = SpecifixJSX<
  "Row",
  { color?: Color; width?: (Width | undefined)[] | undefined; display?: "ansi" | "markdown" },
  ReactNode | ReactNode[] | undefined
>;
export const Row = (props: Omit<IRow, "type">): ReactNode => {
  const type = props.display ?? "ansi";
  return renderRow[type]({
    type: "Row" as const,
    ...props,
  });
};

export const renderRow = {
  ansi: (component: IRow): ReactNode => {
    const color = component.color ?? "gray";
    const totalWidths: number = useWidthContext();
    const _widths = (component.width ?? []).map((e) => {
      if (!e) {
        return undefined;
      }
      if (typeof e === "number") {
        return e;
      }
      if (typeof e === "string" && e.endsWith("%")) {
        return (totalWidths / 100) * parseInt(e, 10);
      }
      return parseInt(e, 10);
    });
    const widthLeft = totalWidths - (_widths.reduce((a, b) => (a ?? 0) + (b ?? 0), 0 as number) as number);
    const children = Array.isArray(component.children) ? component.children : [component.children];
    const widths = Array(children.length)
      .fill(0)
      .map((_e, index) => {
        if (typeof _widths[index] != "undefined") {
          return _widths[index];
        }
        return Math.floor(widthLeft / children.length);
      })
      .filter((e): e is number => typeof e === "number");
    return (
      <Box
        flexDirection="row"
        width="100%"
        borderTop={false}
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
        borderStyle={"single"}
        borderColor={color}
        borderDimColor={true}
      >
        {children.map((e, index) => {
          const child = typeof e === "string" ? <Text>{e}</Text> : e;
          return (
            <Box
              key={index}
              paddingLeft={2}
              paddingRight={2}
              width={widths[index]}
              borderRight={true}
              borderLeft={true}
              borderBottom={true}
              borderTop={true}
              borderStyle={"single"}
              borderColor={color}
              borderDimColor={true}
            >
              {child}
            </Box>
          );
        })}
      </Box>
    );
  },
  markdown: (_component: IRow): ReactNode => {
    throw new Error("Not implemented");
  },
};
