import { describe } from "node:test";

import React from "react";

import { Badge } from "./badge.js";
import { LOREM_IPSUM } from "./lorem.ipsum.spec.js";
import { testJSX } from "./snap-test.js";

describe("Render badge", () => {
  describe("ansi", async () => {
    const tests = [
      testJSX(<Badge>T</Badge>, "render simple string", import.meta.url),
      testJSX(
        <Badge color={"green"} backgroundColor={"blue"}>
          T
        </Badge>,
        "render simple with color",
        import.meta.url,
      ),
      testJSX(<Badge>{LOREM_IPSUM}</Badge>, "render multiple line", import.meta.url),
    ];
    await Promise.all(tests);
  });
});
