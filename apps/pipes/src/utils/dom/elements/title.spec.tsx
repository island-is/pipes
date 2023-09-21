import { describe } from "node:test";

import React from "react";

import { testJSX } from "./snap-test.js";
import { Title } from "./title.js";

describe("Render title", () => {
  describe("ansi", async () => {
    const tests = [testJSX(<Title>Error mesage</Title>, "render simple string", import.meta.url)];
    await Promise.all(tests);
  });
});
