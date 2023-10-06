import React from "react";

import { getScreenWidth } from "../../ink/components/width-context.js";
import { Box, Text } from "../../ink/index.js";

import { Divider } from "./divider.js";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type ITitle = SpecifixJSX<"Title", null, string | string[]>;
export const Title = (props: Omit<ITitle, "type">): ReactNode => {
  const content = Array.isArray(props.children) ? props.children.join("") : props.children;
  return (
    <Box width={getScreenWidth()} marginTop={1} marginBottom={1} alignItems={"center"} flexDirection="column">
      <Box width={getScreenWidth()}>
        <Text bold={true}>{content.toUpperCase()}</Text>
      </Box>
      <Divider />
    </Box>
  );
};
