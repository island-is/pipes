import { describe } from "node:test";

import React from "react";

import { Divider } from "./divider.js";
import { testJSX } from "./snap-test.js";

describe("Render divider", () => {
  describe("ansi", async () => {
    const tests = [testJSX(<Divider />, "render", import.meta.url)];
    await Promise.all(tests);
  });
});
