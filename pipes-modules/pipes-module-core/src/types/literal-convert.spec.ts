import { describe, it } from "node:test";

import { expect } from "./expect.js";

import type { hasManyItems } from "./literal-convert.js";

describe("HasManyItems", () => {
  it("single item: string", () => {
    type SingleItem = hasManyItems<string>;
    const _TEST: SingleItem = false;
    expect(_TEST).toBe(false);
  });
  it("single item: number", () => {
    type SingleItem = hasManyItems<string>;
    const _TEST: SingleItem = false;
    expect(_TEST).toBe(false);
  });
  it("single item: boolean", () => {
    type SingleItem = hasManyItems<boolean>;
    const _TEST: SingleItem = false;
    expect(_TEST).toBe(false);
  });
  it("single item: boolean true", () => {
    type SingleItem = hasManyItems<true>;
    const _TEST: SingleItem = false;
    expect(_TEST).toBe(false);
  });
  it("single item: boolean false", () => {
    type SingleItem = hasManyItems<false>;
    const _TEST: SingleItem = false;
    expect(_TEST).toBe(false);
  });
  it("single item: object", () => {
    type SingleItem = hasManyItems<{}>;
    const _TEST: SingleItem = false;
    expect(_TEST).toBe(false);
  });
  it("only null and undefined and one object", () => {
    type Ble = hasManyItems<number | null | undefined>;
    const _TEST: Ble = true;
    expect(_TEST).toBe(true);
  });
  it("many: object", () => {
    const _TEST: hasManyItems<number | string | { ble: string }> = true;
    expect(_TEST).toBe(true);
  });
});
