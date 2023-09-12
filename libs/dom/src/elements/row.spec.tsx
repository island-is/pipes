import { describe, it } from "node:test";

import { renderToANSIString } from "../ci.js";

import { Row, renderRow } from "./row.js";
import { snapTest } from "./snap-test.js";

const TERMINAL_WIDTH = 114;

describe("Render row", () => {
  describe("ansi", () => {
    it("render one element", () => {
      const element = Row({}, "One row");
      const value = renderRow.ansi(renderToANSIString)(element, TERMINAL_WIDTH);
      console.log(value);
      snapTest(value, import.meta.url, "render one element");
    });
    it("render two element", () => {
      const element = Row({}, ["One row", "Two row"]);
      const value = renderRow.ansi(renderToANSIString)(element, TERMINAL_WIDTH);
      console.log(value);
      snapTest(value, import.meta.url, "render two elements");
    });
    it("render three elements", () => {
      const element = Row({}, ["One row", "Two row", "Three row"]);
      const value = renderRow.ansi(renderToANSIString)(element, TERMINAL_WIDTH);
      console.log(value);
      snapTest(value, import.meta.url, "render three elements");
    });
    it("render four elements", () => {
      const element = Row({}, ["One row", "Two row", "Three row", "Four row"]);
      const value = renderRow.ansi(renderToANSIString)(element, TERMINAL_WIDTH);
      console.log(value);
      snapTest(value, import.meta.url, "render four elements");
    });
    it("render five elements", () => {
      const element = Row({}, ["One row", "Two row", "Three row", "Four row", "Five row"]);
      const value = renderRow.ansi(renderToANSIString)(element, TERMINAL_WIDTH);
      console.log(value);
      snapTest(value, import.meta.url, "render five elements");
    });

    it("render two row multiple lines", () => {
      const element = Row({}, ["1".repeat(200), "2".repeat(200)]);
      const value = renderRow.ansi(renderToANSIString)(element, TERMINAL_WIDTH);
      console.log(value);
      snapTest(value, import.meta.url, "render two row multiple lines");
    });
    it("render three row multiple lines", () => {
      const element = Row({}, ["1".repeat(200), "2".repeat(200), "3".repeat(200)]);
      const value = renderRow.ansi(renderToANSIString)(element, TERMINAL_WIDTH);
      console.log(value);
      snapTest(value, import.meta.url, "render three row multiple lines");
    });
    it("render four row multiple lines", () => {
      const element = Row({}, ["1".repeat(200), "2".repeat(200), "3".repeat(200), "4".repeat(200)]);
      const value = renderRow.ansi(renderToANSIString)(element, TERMINAL_WIDTH);
      console.log(value);
      snapTest(value, import.meta.url, "render four row multiple lines");
    });
    it("render five row multiple lines", () => {
      const element = Row({}, ["1".repeat(200), "2".repeat(200), "3".repeat(200), "4".repeat(200), "5".repeat(200)]);
      const value = renderRow.ansi(renderToANSIString)(element, TERMINAL_WIDTH);
      console.log(value);
      snapTest(value, import.meta.url, "render three five multiple lines");
    });
  });
});
