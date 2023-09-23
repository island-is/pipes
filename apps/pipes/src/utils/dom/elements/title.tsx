import React from "react";

import { Box, Text } from "../../ink/index.js";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type ITitle = SpecifixJSX<"Title", null, string>;
export const Title = (props: Omit<ITitle, "type">): ReactNode => {
  return (
    <Box width="100%" marginTop={1} marginBottom={1} alignItems={"center"}>
      <Text>{props.children}</Text>
    </Box>
  );
};