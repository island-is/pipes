import { describe, it } from "node:test";

import { expect } from "./expect.js";

import type { isEmptyList } from "./is-empty-list.js";

describe("isOnlyBoolean", () => {
  it("boolean", () => {
    type emptyList = isEmptyList<[]>;
    type notEmptyList = isEmptyList<[1]>;

    const _TEST: emptyList = true;
    const _TEST2: notEmptyList = false;

    expect(_TEST).not.toBe(_TEST2);
  });
});
