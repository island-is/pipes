import type { Simplify } from "./simplify.js";
import type { ReactNode } from "react";

export type JSX = {
  type: string;
  children: AnyElement[] | AnyElement;
  props?: Record<string, any>;
};

export type AnyElement = ReactNode;

export type SpecifixJSX<
  type extends string,
  props extends Record<string, any> | null,
  children extends ReactNode | ReactNode[] | undefined,
> = Simplify<
  props extends null ? { type: type } & { children: children } : { type: type } & props & { children: children }
>;
