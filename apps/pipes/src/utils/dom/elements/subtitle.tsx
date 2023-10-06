/* eslint-disable @typescript-eslint/no-use-before-define */
import React from "react";

import { Text } from "../../ink/index.js";

import { Badge } from "./badge.js";
import { Container } from "./container.js";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type Color = Parameters<typeof Container>[0]["color"];
export type ISubtitle = SpecifixJSX<
  "Subtitle",
  { emoji?: string; color?: Color; display?: "ansi" | "markdown" | undefined },
  string | string[]
>;
export const Subtitle = (props: Omit<ISubtitle, "type">): ReactNode => {
  const type = props.display ?? "ansi";
  return renderSubtitle[type]({
    type: "Subtitle",
    ...props,
  });
};

export const renderSubtitle = {
  ansi: (component: ISubtitle): ReactNode => {
    const color = component.color ?? "blue";
    const label = component.emoji ? (
      <Badge color={"white"} backgroundColor={color}>
        {component.emoji}
      </Badge>
    ) : (
      <></>
    );
    const value = Array.isArray(component.children) ? component.children.join("") : component.children;
    return (
      <Container color={color}>
        {label}
        <Text backgroundColor={color} color={"white"} bold={true}>
          {" ".repeat(2)}
          {value.toUpperCase()}
          {" ".repeat(2)}
        </Text>
      </Container>
    );
  },

  markdown: (component: ISubtitle): ReactNode => {
    throw new Error("Not implemented");
    return `## ${component.children}`;
  },
};
