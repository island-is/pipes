import * as assert from "node:assert";
import { describe, it } from "node:test";

import { CSS_COLORS } from "./colors.js";
import { computeCSS } from "./css.js";

import type { CSS } from "./types.js";

describe("computeCSS function", () => {
  it("should return a CSS object with correct color", () => {
    const css: CSS = { color: "blue" };
    const computed = computeCSS(css, 100);
    assert.strictEqual(computed.color, CSS_COLORS["BLUE"]);
  });

  it("should handle undefined color", () => {
    const css: CSS = { color: undefined };
    const computed = computeCSS(css, 100);
    assert.strictEqual(computed.color, undefined);
  });

  it("should handle invalid color", () => {
    const css: any = { color: "not-a-color" };
    const computed = computeCSS(css, 100);
    assert.strictEqual(computed.color, undefined);
  });

  it("should handle width as a number", () => {
    const css: CSS = { width: 20 };
    const computed = computeCSS(css, 100);
    assert.strictEqual(computed.width, 20);
  });

  it("should handle width as 'auto'", () => {
    const css: CSS = { width: "auto" };
    const computed = computeCSS(css, 100);
    assert.strictEqual(computed.width, undefined);
  });

  it("should handle padding shorthand as string", () => {
    const css: CSS = { padding: "10ch 20ch 30ch 40ch" };
    const computed = computeCSS(css, 100);
    assert.deepStrictEqual(computed.paddingTop, 10);
    assert.deepStrictEqual(computed.paddingRight, 20);
    assert.deepStrictEqual(computed.paddingBottom, 30);
    assert.deepStrictEqual(computed.paddingLeft, 40);
  });

  it("should handle border enablement", () => {
    const css: CSS = { border: { enabled: true } };
    const computed = computeCSS(css, 100);
    assert.strictEqual(computed.borderTop, true);
    assert.strictEqual(computed.borderRight, true);
    assert.strictEqual(computed.borderBottom, true);
    assert.strictEqual(computed.borderLeft, true);
  });

  it("should handle margin shorthand as string", () => {
    const css: CSS = { margin: "5 10 15 20" };
    const computed = computeCSS(css, 100);
    assert.deepStrictEqual(computed.marginTop, 5);
    assert.deepStrictEqual(computed.marginRight, 10);
    assert.deepStrictEqual(computed.marginBottom, 15);
    assert.deepStrictEqual(computed.marginLeft, 20);
  });
  it("should handle empty string color", () => {
    const css: CSS = { color: "" } as any;
    const computed = computeCSS(css, 100);
    assert.strictEqual(computed.color, undefined);
  });

  it("should handle null color", () => {
    const css: CSS = { color: null } as any;
    const computed = computeCSS(css, 100);
    assert.strictEqual(computed.color, undefined);
  });

  it("should handle negative width", () => {
    const css: CSS = { width: -20 };
    const computed = computeCSS(css, 100);
    assert.strictEqual(computed.width, undefined);
  });

  it("should handle padding with one value", () => {
    const css: CSS = { padding: "10ch" };
    const computed = computeCSS(css, 100);
    assert.deepStrictEqual(computed.paddingTop, 10);
    assert.deepStrictEqual(computed.paddingRight, 10);
    assert.deepStrictEqual(computed.paddingBottom, 10);
    assert.deepStrictEqual(computed.paddingLeft, 10);
  });
  it("should handle empty input", () => {
    const css: CSS = {};
    const computed = computeCSS(css, 100);
    assert.deepStrictEqual(computed, { visibility: true });
  });
  it("should handle all undefined properties", () => {
    const css: CSS = { color: undefined, width: undefined, padding: undefined };
    const computed = computeCSS(css, 100);
    assert.strictEqual(computed.color, undefined);
    assert.strictEqual(computed.width, undefined);
    assert.strictEqual(computed.paddingTop, undefined);
  });
});
