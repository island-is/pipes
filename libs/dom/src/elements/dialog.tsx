import { Box, Text } from "@island-is/ink";
import React from "react";

import { Subtitle } from "./subtitle.js";

import type { ReactNode } from "react";

export type DialogType = "default" | "error" | "success" | "failure";
export type Color = Parameters<typeof Box>[0]["borderColor"];

export type DialogProps = {
  dialogType?: DialogType;
  children?: ReactNode | ReactNode[];
  title: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number; // number of lines
  paddingBottom?: number; // number of lines
};
export type IDialog = { type: "Dialog" } & DialogProps;
export const Dialog = (props: Omit<IDialog, "type">): ReactNode => {
  const emojiType = {
    default: "*",
    error: "X",
    success: "✔",
    failure: "!",
  }[props.dialogType ?? "default"];
  const borderColor = {
    default: "blue",
    error: "red",
    success: "green",
    failure: "red",
  }[props.dialogType ?? "default"];
  const children = React.Children.map(React.Children.toArray(props.children), (e) => {
    if (typeof e === "string" || typeof e === "number") {
      return <Text>{`${e}`.trim()}</Text>;
    }
    return e;
  });

  return (
    <Box
      borderStyle={"double"}
      borderColor={borderColor}
      flexDirection="column"
      width={"100%"}
      paddingLeft={props.paddingLeft ?? 1}
      paddingRight={props.paddingLeft ?? 1}
      paddingTop={props.paddingTop ?? 1}
      paddingBottom={props.paddingBottom ?? 1}
    >
      <Subtitle color={borderColor} emoji={emojiType}>
        {props.title}
      </Subtitle>
      <Box width="100%" height={(props.paddingBottom ?? 1) + (props.paddingTop ?? 1)}></Box>
      {children}
    </Box>
  );
};
