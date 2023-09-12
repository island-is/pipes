import { describe, it } from "node:test";

import { renderToANSIString } from "../ci.js";

import { Badge, renderBadge } from "./badge.js";
import { span } from "./css/span.js";
import { LOREM_IPSUM } from "./lorem.ipsum.spec.js";
import { snapTest } from "./snap-test.js";

describe("Render badge", () => {
  describe("ansi", () => {
    it("render simple string", () => {
      const element = Badge({}, "T");
      const value = renderBadge.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render simple string");
    });
    it("render simple string with color", () => {
      const child = span(
        "This is text  Trewopijgperjgpewqojgpoewj",
        {
          color: "green",
          backgroundColor: "blue",
        },
        100,
      );
      const element = Badge({}, child[0]);
      const value = renderBadge.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render simple string with color");
      console.log(`Badge Colored String: ${value}`);
    });
    it("render multiple lines", () => {
      // This should be cut out!
      const element = Badge({}, LOREM_IPSUM);
      const value = renderBadge.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render multiple lines");
      console.log(`Badge Multiple Lines String: ${value}`);
    });
    it("render multiple lines with color", () => {
      const child = span(
        LOREM_IPSUM,
        {
          color: "green",
          backgroundColor: "blue",
        },
        100,
      );
      const element = Badge({}, child[0]);
      const value = renderBadge.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render multiple lines with color");
      console.log(`Badge Multiple Lines String: ${value}`);
    });
  });
});
