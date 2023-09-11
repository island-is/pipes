import { DOMError, PipesDOM } from "@island-is/dom";

import { render } from "./render.js";

function isErr(e: unknown): e is Error {
  return e instanceof Error;
}

function unknownToString(e: unknown): string {
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
export const throwJSXError = (context: any, config: any, errorMSG: unknown, shouldRender: boolean = false) => {
  const { stack } = context as unknown as { stack: string[] };
  const { appName } = config as unknown as { appName: string };
  const jsxSTACK = stack.map((e) => (
    <PipesDOM.TableRow>
      <PipesDOM.TableCell>{e}</PipesDOM.TableCell>
    </PipesDOM.TableRow>
  ));

  const jsx = (
    <PipesDOM.Error>
      <PipesDOM.Table>
        <PipesDOM.TableRow>Error in context: {appName} </PipesDOM.TableRow>
        <PipesDOM.Table>{jsxSTACK}</PipesDOM.Table>
        <PipesDOM.TableRow>{unknownToString(errorMSG)}</PipesDOM.TableRow>
      </PipesDOM.Table>
    </PipesDOM.Error>
  );
  if (shouldRender) {
    void render(() => jsx, true);
  }
  throw new DOMError(jsx);
};
