import ciinfo from "ci-info";

import { Command } from "../github-command.js";

export type IMask = { type: "Mask"; values: string[] | string };
export const Mask = (props: Omit<IMask, "type" | "children">): { props: IMask } => {
  return {
    props: {
      type: "Mask",
      ...props,
    },
  };
};

export const renderMask = {
  ansi: (component: IMask): string => {
    const values = (Array.isArray(component.values) ? component.values : [component.values]).filter(
      (e) => typeof e === "string" && e.length > 1,
    );

    if (ciinfo.GITHUB_ACTIONS) {
      return values.map((e) => new Command("add-mask", {}, e).toString()).join("\n");
    }

    return "";
  },
  markdown: (_component: IMask): string => {
    return "";
  },
};
