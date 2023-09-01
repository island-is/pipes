import React from "react";

import { Dialog } from "./dialog.js";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type ISuccess = SpecifixJSX<"Success", { title?: string }, ReactNode | ReactNode[]>;
export const Success = (props: Omit<ISuccess, "type">): ReactNode => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return renderSuccess.ansi({
    type: "Success",
    ...props,
  });
};

export const renderSuccess = {
  ansi: (component: ISuccess): ReactNode => {
    return (
      <Dialog dialogType="success" title={component.title ?? "Success"}>
        {component.children}
      </Dialog>
    );
  },

  markdown: (_component: ISuccess): ReactNode => {
    throw new Error("Not implemented");
  },
};
