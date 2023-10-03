import React from "react";

import { Text } from "../../ink/index.js";

import { Container } from "./container.js";
import { Row } from "./row.js";
import { Subtitle } from "./subtitle.js";

import type { Box } from "../../ink/index.js";
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
    default: "",
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
  const allIsString = React.Children.toArray(props.children).every(
    (e) => typeof e === "string" || typeof e === "number",
  );
  let children = React.Children.map(React.Children.toArray(props.children), (e) => {
    if (allIsString) {
      return e;
    }
    if (typeof e === "string" || typeof e === "number") {
      return <Text>{`${e}`.trim()}</Text>;
    }
    return e;
  });
  if (allIsString) {
    children = [<Text key="text">{children.join("")}</Text>];
  }
  if (children.length === 0) {
    return <></>;
  }
  const dialogType = props.dialogType ?? "default";
  if (dialogType === "default") {
    return (
      <Row width={[1, undefined]}>
        <></>
        <Container>{children}</Container>
      </Row>
    );
  }
  return (
    <Row width={[18, undefined]}>
      <Subtitle color={borderColor} emoji={emojiType}>
        {props.title}
      </Subtitle>
      <Container>{children}</Container>
    </Row>
  );
};
