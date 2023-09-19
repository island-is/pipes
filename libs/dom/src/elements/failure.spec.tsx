import { describe } from "node:test";

import React from "react";

// Assuming error component file is named error.js
import { Failure } from "./failure.js";
import { LOREM_IPSUM } from "./lorem.ipsum.spec.js";
import { testJSX } from "./snap-test.js";

describe("Render failure", () => {
  describe("ansi", async () => {
    const tests = [
      testJSX(<Failure>Error mesage</Failure>, "render simple string", import.meta.url),
      testJSX(<Failure>{LOREM_IPSUM}</Failure>, "render multiple line", import.meta.url),
    ];
    await Promise.all(tests);
  });
});
