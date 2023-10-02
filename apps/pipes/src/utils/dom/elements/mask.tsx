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
  values.forEach((value: string) => {
    process.stdout.write(new Command("add-mask", {}, value).toString());
    process.stdout.write("\n");
  });

  return <></>;
};
