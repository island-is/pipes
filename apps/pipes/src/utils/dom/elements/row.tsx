/* eslint-disable @typescript-eslint/no-use-before-define */

import React from "react";

import { Box, Text } from "../../ink/index.js";

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
    const children = Array.isArray(component.children) ? component.children : [component.children];
    const widths = Array(children.length)
      .fill(0)
      .map((_e) => {
        return `${Math.floor(100 / children.length)}%`;
      });

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
            <Box key={index} alignSelf="flex-start" paddingLeft={1} paddingRight={1} width={widths[index]}>
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
