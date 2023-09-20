import { Box, Text } from "@island-is/ink";
import ciinfo from "ci-info";
import React from "react";

import { Command } from "../github-command.js";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type IGroup = SpecifixJSX<"Group", { title: string }, any | any[]>;
export const Group = (props: Omit<IGroup, "type">): ReactNode => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return renderGroup.ansi({
    type: "Group",
    ...props,
  });
};

export const renderGroup = {
  ansi: (component: IGroup): ReactNode => {
    if (React.Children.toArray(component.children).length === 0) {
      return <></>;
    }

    if (ciinfo.GITHUB_ACTIONS) {
      const startGroup = new Command("group", {}, component.title).toString();
      const endGroup = new Command("endgroup", {}, "").toString();
      return (
        <>
          <Text>{startGroup}</Text>
          {component.children}
          <Text>{endGroup}</Text>
        </>
      );
    }
    return (
      <>
        <Box width="100%" alignItems="flex-end">
          <Text color="white" underline={true}>
            {component.title.trim()}
          </Text>
        </Box>
        {component.children}
      </>
    );
  },
  markdown: (component: IGroup, _width: number): ReactNode => {
    return component.children;
  },
};
