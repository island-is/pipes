import React from "react";

import { Dialog } from "./dialog.js";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type IInfo = SpecifixJSX<"Info", { title?: string }, ReactNode | ReactNode[]>;
export const Info = (props: Omit<IInfo, "type">): ReactNode => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return renderInfo({
    type: "Info",
    ...props,
  });
};

const renderInfo = (props: IInfo): ReactNode => {
  return <Dialog title={props.title ?? "Info"}>{props.children}</Dialog>;
};
