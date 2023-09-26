import React from "react";

import { Box, Text } from "../../ink/index.js";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type ILog = SpecifixJSX<"Log", null, any>;
export const Log = (props: Omit<ILog, "type">): ReactNode => {
  return (
    <Box width={"100%"} flexDirection="row">
      <Text>{props.children}</Text>
    </Box>
  );
};
