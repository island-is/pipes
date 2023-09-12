import { describe, it } from "node:test";

import { renderToANSIString } from "../ci.js";

import { span } from "./css/span.js";
import { Error, renderError } from "./error.js"; // Assuming error component file is named error.js
import { LOREM_IPSUM } from "./lorem.ipsum.spec.js";
import { snapTest } from "./snap-test.js";
const TERMINAL_WIDTH = process.stdout.columns;

describe("Render error", () => {
  describe("ansi", () => {
    it("render simple string error", () => {
      const element = Error({}, "Error message");
      const value = renderError.ansi(renderToANSIString)(element, process.stdout.columns);
      console.log(JSON.stringify(value));
      console.log(`\n${value}`);
      snapTest(value, import.meta.url, "render simple string error");
    });
  });
});
