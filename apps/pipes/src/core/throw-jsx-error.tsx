import React from "react";

import * as PipesDOM from "../utils/dom/dom.js";
import { PipesObject } from "../utils/dom/elements/object.js";
import { Box, Text } from "../utils/ink/index.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const throwJSXError = (context: any, config: any, errorMSG: unknown, errorstack?: string): never => {
  const { stack: _stack, modules: _modules } = context as unknown as { stack: string[]; modules: string[] };
  const { appName } = config as unknown as { appName: string };
  const stack = Array.isArray(_stack) ? _stack : [];
  const modules: string[] = Array.isArray(_modules) ? _modules : [];
  const jsxSTACK =
    stack.length > 0 ? (
      <Box width="100%" marginLeft={2} marginTop={1}>
        <PipesDOM.Text bold={true}>Stack</PipesDOM.Text>
        {stack.map((e, i) => (
          <PipesDOM.Text key={i}>{e}</PipesDOM.Text>
        ))}
      </Box>
    ) : (
      <></>
    );
  const jsxModules =
    modules.length > 0 ? (
      <Box width="100%" marginLeft={2} marginTop={1} flexDirection={"column"}>
        <PipesDOM.Text bold={true}>Modules</PipesDOM.Text>
        {stack.map((e) => (
          <Box flexDirection={"column"} key={e}>
            <PipesDOM.Text color="green">{e}</PipesDOM.Text>
          </Box>
        ))}
      </Box>
    ) : (
      <></>
    );
  const configError = config ? (
    <Box width="100%" marginLeft={1} marginTop={1} flexDirection={"column"}>
      <PipesDOM.Text bold={true}>{appName ? `Config values for ${appName}` : `Config values`}</PipesDOM.Text>
      <Box width="100%" flexDirection={"column"}>
        {Object.keys(config)
          .filter((key) => key !== "appName")
          .map((value) => (
            <>
              <Box height={1} width={"100%"}>
                <></>
              </Box>
              <Box width="100%">
                <PipesDOM.Text color="green">
                  {value}
                  {"  "}
                </PipesDOM.Text>
                <PipesObject value={config[value]} key={value} />
              </Box>
            </>
          ))}
      </Box>
    </Box>
  ) : (
    <></>
  );
  const jsx = (
    <Box width="100%" flexDirection={"column"}>
      <PipesDOM.Divider />
      {appName ? (
        <PipesDOM.Error>Error in context: {appName}</PipesDOM.Error>
      ) : (
        <PipesDOM.Error>Unknown Error!</PipesDOM.Error>
      )}
      {jsxModules}
      {jsxSTACK}
      {configError}
      <Text>{errorstack ?? ""}</Text>
      <Box width="100%" flexDirection={"row"} marginLeft={1}>
        <PipesDOM.Badge color="white" backgroundColor={"red"}>
          !
        </PipesDOM.Badge>
        <PipesObject value={errorMSG} />
      </Box>
      <PipesDOM.Divider />
    </Box>
  );
  throw new PipesDOM.DOMError(jsx);
};
