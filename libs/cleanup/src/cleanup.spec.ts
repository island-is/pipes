import assert from "node:assert";
import { test } from "node:test";

import { onCleanup } from "./cleanup.js";

/**
 * We only can do one test! HAHA!
 */
test("onCleanup should trigger callback on 'exit'", () => {
  let x = 0;
  onCleanup(() => {
    x += 1;
  });
  onCleanup(() => {
    x += 1;
  });
  onCleanup(() => {
    x += 1;
  });
  onCleanup(() => {
    assert.equal(x, 3);
  });
  process.exit(0);
});
