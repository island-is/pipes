import React from "react";

import { Dialog } from "./dialog.js";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type IFailure = SpecifixJSX<"Failure", { title?: string }, ReactNode | ReactNode[]>;
export const Failure = (props: Omit<IFailure, "type">): ReactNode => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return renderFailure.ansi({
    type: "Failure",
    ...props,
  });
};

export const renderFailure = {
  ansi: (component: IFailure): ReactNode => {
    return (
      <Dialog title={component.title ?? "Failure"} dialogType={"failure"}>
        {component.children}
      </Dialog>
    );
  },

  markdown: (_component: IFailure): ReactNode => {
    throw new Error(`Not implemented`);
  },
};
