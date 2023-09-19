import { describe } from "node:test";

import React from "react";

import { Error } from "./error.js"; // Assuming error component file is named error.js
import { LOREM_IPSUM } from "./lorem.ipsum.spec.js";
import { testJSX } from "./snap-test.js";

describe("Render error", () => {
  describe("ansi", async () => {
    const tests = [
      testJSX(<Error>Error mesage</Error>, "render simple string", import.meta.url),
      testJSX(<Error>{LOREM_IPSUM}</Error>, "render multiple line", import.meta.url),
    ];
    await Promise.all(tests);
  });
});
