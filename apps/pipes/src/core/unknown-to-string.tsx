import React from "react";

import * as PipesDOM from "../utils/dom/dom.js";

import type { ReactNode } from "react";

function isErr(e: unknown): e is Error {
  return !!(typeof e === "object" && e instanceof Error);
}

function unknownToString(e: unknown): ReactNode {
  if (e instanceof PipesDOM.DOMError) {
    return e.get();
  }
  if (isErr(e)) {
    return `${e.message}\n${e.stack || ""}`;
  } else if (typeof e === "string") {
    return e;
  } else if (typeof e === "number" || typeof e === "boolean" || e === null) {
    return String(e);
  } else if (typeof e === "undefined") {
    return "Unknown Error";
  } else if (typeof e === "object") {
    if ("message" in e) {
      return JSON.stringify(e.message);
    }
    return JSON.stringify(e);
  } else if (e == null) {
    return "Unknown error";
  }
  return JSON.stringify(e);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const throwJSXError = (context: any, config: any, errorMSG: unknown, shouldRender: boolean = true) => {
  const { stack } = context as unknown as { stack: string[] };
  const { appName } = config as unknown as { appName: string };
  const jsxSTACK = stack.map((e, index) => <PipesDOM.Error key={index}>{e}</PipesDOM.Error>);

  const jsx = (
    <PipesDOM.Container>
      <PipesDOM.Error>Error in context: {appName}</PipesDOM.Error>
      {jsxSTACK}
      <PipesDOM.Error>{unknownToString(errorMSG)}</PipesDOM.Error>
    </PipesDOM.Container>
  );
  if (shouldRender) {
    void PipesDOM.render(() => jsx, {
      forceRenderNow: true,
    });
  }
  throw new PipesDOM.DOMError(jsx);
};
