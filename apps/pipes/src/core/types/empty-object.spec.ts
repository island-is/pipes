/* eslint-disable unused-imports/no-unused-vars */
import assert from "node:assert";
import { describe, it } from "node:test";

import type { EmptyObject } from "./empty-object.js";

describe("empty object", () => {
  it("test", () => {
    const d: EmptyObject = {};
    // @ts-expect-error - This should fail.
    const x: EmptyObject = { ble: 1 };
    assert.ok(true);
  });
});
