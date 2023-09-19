import { Box, Text } from "@island-is/ink";
import React from "react";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type ILog = SpecifixJSX<"Log", null, string>;
export const Log = (props: Omit<ILog, "type">): ReactNode => {
  return (
    <Box width={"100%"} flexDirection="row">
      <Text>{props.children}</Text>
    </Box>
  );
};
