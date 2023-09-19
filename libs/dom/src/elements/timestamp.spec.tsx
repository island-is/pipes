import { describe } from "node:test";

import React from "react";

import { testJSX } from "./snap-test.js";
import { Timestamp } from "./timestamp.js";

describe("Render Timestamp", () => {
  describe("ansi", async () => {
    const tests = [
      testJSX(<Timestamp time={new Date("2023-09-10T10:20:30Z")} />, "render simple timestamp", import.meta.url),
      testJSX(
        <Timestamp time={new Date("2023-09-10T10:20:30Z")} format="European" />,
        "render timestamp with european format",
        import.meta.url,
      ),
      testJSX(
        <Timestamp time={new Date("2023-09-10T10:20:30Z")} format="American" />,
        "render timestamp with american format",
        import.meta.url,
      ),
      testJSX(
        <Timestamp time={new Date("2023-09-10T10:20:30Z")} format="ISO" />,
        "render timestamp with iso format",
        import.meta.url,
      ),
      testJSX(
        <Timestamp time={new Date(0)} format="yyyy-MM-dd HH:mm" />,
        "render timestamp with custom format",
        import.meta.url,
      ),
      testJSX(
        <Timestamp time={new Date(1000 * 60 * 60)} format="HH:mm:ss" />,
        "render timestamp with custom format - only time",
        import.meta.url,
      ),
      testJSX(
        <Timestamp time={new Date(NaN)} format="HH:mm:ss" />,
        "render timestamp with invalid time",
        import.meta.url,
      ),
      testJSX(
        <Timestamp time={new Date(0)} format="YYYY-mm-DD" />,
        "render timestamp with invalid format",
        import.meta.url,
      ),
    ];

    await Promise.all(tests);
  });
});
