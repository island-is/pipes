import { describe } from "node:test";

import React from "react";

import { Row } from "./row.js";
import { testJSX } from "./snap-test.js";

const simpleRow = (number: number) => {
  return ["One row", "Two row", "Three row", "Four row", "Five row", "Six rows"].slice(0, number);
};

const bigRow = (number: number) => {
  return Array(number)
    .fill("1")
    .map((e, index) => `${index + 1}`.repeat(200));
};

describe("Render row", () => {
  describe("ansi", async () => {
    const tests = [
      testJSX(<Row>One row</Row>, "One row", import.meta.url),
      testJSX(<Row>{simpleRow(2)}</Row>, simpleRow(2).slice(-1)[0], import.meta.url),
      testJSX(<Row>{simpleRow(3)}</Row>, simpleRow(3).slice(-1)[0], import.meta.url),
      testJSX(<Row>{simpleRow(4)}</Row>, simpleRow(4).slice(-1)[0], import.meta.url),
      testJSX(<Row>{simpleRow(5)}</Row>, simpleRow(5).slice(-1)[0], import.meta.url),
      testJSX(<Row>{simpleRow(6)}</Row>, simpleRow(6).slice(-1)[0], import.meta.url),
      testJSX(<Row>{bigRow(1)}</Row>, "1", import.meta.url),
      testJSX(<Row>{bigRow(2)}</Row>, "2", import.meta.url),
      testJSX(<Row>{bigRow(3)}</Row>, "3", import.meta.url),
      testJSX(<Row>{bigRow(4)}</Row>, "4", import.meta.url),
      testJSX(<Row>{bigRow(5)}</Row>, "5", import.meta.url),
      testJSX(<Row>{bigRow(6)}</Row>, "6", import.meta.url),
    ];
    await Promise.all(tests);
  });
});
