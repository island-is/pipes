/* eslint-disable @typescript-eslint/no-use-before-define */
import { Box } from "@island-is/ink";
import React from "react";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type Color = Parameters<typeof Box>["0"]["borderColor"];
export type IContainer = SpecifixJSX<
  "Container",
  { color?: Color; padding?: number },
  ReactNode | ReactNode[] | null | string
>;
export const Container = (props: Omit<IContainer, "type">): ReactNode => {
  return renderContainer.ansi({
    type: "Container",
    ...props,
  });
};

export const renderContainer = {
  ansi: (component: IContainer): ReactNode => {
    const color = component.color ?? undefined;
    return (
      <Box
        borderColor={color}
        alignSelf="center"
        paddingLeft={component.padding ?? 0}
        paddingRight={component.padding ?? 0}
      >
        {component.children}
      </Box>
    );
  },

  markdown: (_component: IContainer): ReactNode => {
    throw new Error("Not implemented");
  },
};
