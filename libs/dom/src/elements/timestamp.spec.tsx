import { describe, it } from "node:test";

import { renderToANSIString } from "../ci.js";

import { snapTest } from "./snap-test.js";
import { Timestamp, renderTimestamp } from "./timestamp.js";

describe("Render Timestamp", () => {
  describe("ansi", () => {
    it("render simple timestamp", () => {
      const element = Timestamp({ time: new Date("2023-09-10T10:20:30Z") });
      const value = renderTimestamp.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render simple timestamp");
      console.log(`Timestamp Simple: ${value}`);
    });
    it("render timestamp with European format", () => {
      const element = Timestamp({
        time: new Date("2023-09-10T10:20:30Z"),
        format: "European",
      });
      const value = renderTimestamp.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render timestamp with european format");
      console.log(`Timestamp European Format: ${value}`);
    });
    it("render timestamp with American format", () => {
      const element = Timestamp({
        time: new Date("2023-09-10T10:20:30Z"),
        format: "American",
      });
      const value = renderTimestamp.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render timestamp with american format");
      console.log(`Timestamp American Format: ${value}`);
    });
    it("render timestamp with iso", () => {
      const element = Timestamp({
        time: new Date("2023-09-10T10:20:30Z"),
        format: "ISO",
      });
      const value = renderTimestamp.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render timestamp with iso format");
      console.log(`Timestamp ISO Format: ${value}`);
    });
    it("render timestamp with custom format", () => {
      const element = Timestamp({
        time: new Date(0),
        format: "yyyy-MM-dd HH:mm",
      });
      const value = renderTimestamp.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render timestamp with custom format");
      console.log(`Timestamp Custom Format: ${value}`);
    });
    it("render timestamp with custom format - only time", () => {
      const element = Timestamp({
        time: new Date(1000 * 60 * 60),
        format: "HH:mm:ss",
      });
      const value = renderTimestamp.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render timestamp with custom format - only time");
      console.log(`Timestamp Custom Format: ${value}`);
    });
    it("render invalid time", () => {
      const element = Timestamp({
        time: new Date(NaN),
        format: "HH:mm:ss",
      });
      const value = renderTimestamp.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render timestamp with invalid time");
      console.log(`Invalid time: ${value}`);
    });
    it("render invalid format", () => {
      const element = Timestamp({
        time: new Date(0),
        format: "YYYY-mm-DD",
      });
      const value = renderTimestamp.ansi(renderToANSIString)(element);
      snapTest(value, import.meta.url, "render timestamp with invalid format");
      console.log(`Invalid format: ${value}`);
    });
  });
});
