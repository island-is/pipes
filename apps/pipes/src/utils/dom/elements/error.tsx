/* eslint-disable @typescript-eslint/no-use-before-define */
import React from "react";

import { Dialog } from "./dialog.js";

import type { ReactNode } from "react";

export interface IError {
  type: "Error";
  title?: string | undefined | null;
  children?: ReactNode | ReactNode[];
}
export const _Error = (props: Omit<IError, "type">): ReactNode => {
  const children = (Array.isArray(props.children) ? [...props.children] : [props.children]).filter(Boolean);
  return renderError.ansi({
    type: "Error",
    ...props,
    children,
  });
};

export const renderError = {
  ansi: (component: IError): ReactNode => {
    return (
      <Dialog title={component.title ?? "Error"} dialogType={"error"}>
        {component.children}
      </Dialog>
    );
  },

  markdown: (_component: IError): ReactNode => {
    throw "Not implemented";
  },
};
