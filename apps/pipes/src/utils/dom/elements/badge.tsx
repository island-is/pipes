/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";

import { Box, Text } from "../../ink/index.js";

import type { SpecifixJSX } from "./jsx.js";

type Color = Parameters<typeof Text>[0]["color"];
type BackgroundColor = Parameters<typeof Text>[0]["color"];

export type IBadge = SpecifixJSX<
  "Badge",
  { color?: Color; backgroundColor?: BackgroundColor; display?: "ansi" | "markdown" | undefined },
  string
>;
export const Badge = (props: Omit<IBadge, "type">): React.ReactNode => {
  const type = props.display ?? "ansi";
  return renderBadge[type]({
    type: "Badge",
    ...props,
  });
};

export const renderBadge = {
  ansi: (component: IBadge): React.ReactNode => {
    const val = component.children.trim().split("")[0] ?? "X";
    return (
      <Box height={1} marginLeft={1} marginRight={1} width={4}>
        <Text wrap={"truncate"} bold={true} color={component.color} backgroundColor={component.backgroundColor}>
          [{val}]
        </Text>
      </Box>
    );
  },
  markdown: (_component: IBadge): string => {
    throw new Error("Not implemented");
  },
};
