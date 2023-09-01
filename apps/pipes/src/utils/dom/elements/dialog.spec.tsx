import { describe } from "node:test";

import React from "react";

import { Dialog } from "./dialog.js";
import { LOREM_IPSUM } from "./lorem.ipsum.spec.js";
import { testJSX } from "./snap-test.js";

describe("Render dialog", () => {
  describe("ansi", async () => {
    const tests = [
      testJSX(<Dialog title="Test">This is a message</Dialog>, "render", import.meta.url),
      testJSX(
        <Dialog title="Test" paddingBottom={1} paddingTop={1}>
          This is a message
        </Dialog>,
        "padding",
        import.meta.url,
      ),
      testJSX(
        <Dialog title="Test" paddingBottom={1} paddingTop={1}>
          {LOREM_IPSUM}
        </Dialog>,
        "multiple lines",
        import.meta.url,
      ),
      testJSX(
        <Dialog title="Test" dialogType={"error"} paddingBottom={1} paddingTop={1}>
          {LOREM_IPSUM}
        </Dialog>,
        "error",
        import.meta.url,
      ),
    ];
    await Promise.all(tests);
  });
});
