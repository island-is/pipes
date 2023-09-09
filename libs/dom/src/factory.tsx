/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { PipeComponents } from "./elements/elements.js";

export function PipesJSXFactory(type: string | PipeComponents, props?: any, ...children: any): PipeComponents {
  if (type === null) {
    return {
      type: "Fragment",
      children: children.length ? children : null,
    };
  }

  if (typeof type === "string") {
    return type;
  }
  if (type && typeof type === "function") {
    const value = (type as any)(props, children);
    return value;
  }
  throw new Error("Invalid component passed to PipesJSXFactory");
}

export * from "./elements/elements.js";
