import { Box, Text } from "@island-is/ink";
import React from "react";

import { Container } from "./container.js";

import type { AnyElement, SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type IList = SpecifixJSX<"List", null, AnyElement[] | AnyElement | null>;
export type IListItem = SpecifixJSX<"ListItem", null, AnyElement>;
export const List = (props: Omit<IList, "type">): ReactNode => {
  return <Container padding={2}>{props.children}</Container>;
};

export const ListItem = (props: Omit<IListItem, "type">): ReactNode => {
  const child = ["string", "number"].includes(typeof props.children) ? <Text>{props.children}</Text> : props.children;
  return (
    <Box width={"100%"} flexDirection="row">
      <Text>- </Text>
      {child}
    </Box>
  );
};
