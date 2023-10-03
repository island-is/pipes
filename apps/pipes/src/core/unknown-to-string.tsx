import React from "react";

import * as PipesDOM from "../utils/dom/dom.js";
import { PipesObject } from "../utils/dom/elements/object.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const throwJSXError = (context: any, config: any, errorMSG: unknown): never => {
  const { stack } = context as unknown as { stack: string[] };
  const { appName } = config as unknown as { appName: string };
  const jsxSTACK = stack.map((e, index) => (
    <PipesDOM.Error key={index}>
      <PipesDOM.Text>{e}</PipesDOM.Text>
    </PipesDOM.Error>
  ));
  const contextError = context ? (
    <PipesDOM.Info>
      <PipesDOM.Text bold={true}>Context</PipesDOM.Text>
      <PipesObject value={context} />
    </PipesDOM.Info>
  ) : (
    <></>
  );
  const configError = config ? (
    <PipesDOM.Info>
      <PipesDOM.Text bold={true}>Config</PipesDOM.Text>
      <PipesObject value={config} />
    </PipesDOM.Info>
  ) : (
    <></>
  );
  const jsx = (
    <PipesDOM.Container>
      <PipesDOM.Error>Error in context: {appName}</PipesDOM.Error>
      {contextError}
      {configError}
      {jsxSTACK}
      <PipesDOM.Error>
        <PipesObject value={errorMSG} />
      </PipesDOM.Error>
    </PipesDOM.Container>
  );

  throw new PipesDOM.DOMError(jsx);
};
