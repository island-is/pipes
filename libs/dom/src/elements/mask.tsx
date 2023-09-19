import { Transform } from "@island-is/ink";
import ciinfo from "ci-info";
import React from "react";

import { Command } from "../github-command.js";

import type { ReactNode } from "react";

export type IMask = { type: "Mask"; values: string[] | string };
export const Mask = (props: Omit<IMask, "type">): ReactNode => {
  if (!ciinfo.GITHUB_ACTIONS) {
    return <></>;
  }
  const values = [props.values].flat();
  return (
    <Transform
      transform={(line) => {
        return `${new Command("add-mask", {}, line).toString()}\n`;
      }}
    >
      {values.map((value) => value)}
    </Transform>
  );
};
