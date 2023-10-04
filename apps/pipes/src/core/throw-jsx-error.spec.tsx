import React from "react";
import { describe, it } from "node:test";

import { PipesDOM } from "../pipes-core.js";

import { throwJSXError } from "./throw-jsx-error.js";

describe("throw jsx error", async () => {
  let e: any;
  await it("simple error", async () => {
    try {
      // To get the jsx
      throwJSXError({ test: 1 }, { stacks: ["hehe"] }, "what");
    } catch (_e) {
      console.log("error");
      e = _e;
    }
    console.log(e.get);
    await PipesDOM.render(e.get, { forceRenderNow: true });
    await PipesDOM.render(e.get, { forceRenderNow: true });
    await PipesDOM.render(e.get, { forceRenderNow: true });
    await PipesDOM.render(e.get, { forceRenderNow: true });
    await PipesDOM.render(<PipesDOM.Info>hehe</PipesDOM.Info>, { forceRenderNow: true });
  });
});
