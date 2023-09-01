import React from "react";

import { Dialog } from "./dialog.js";

import type { SpecifixJSX } from "./jsx.js";
import type { ReactNode } from "react";

export type ILog = SpecifixJSX<"Log", null, any>;
export const Log = (props: Omit<ILog, "type">): ReactNode => {
  return <Dialog title={"Log"}>{props.children}</Dialog>;
};
