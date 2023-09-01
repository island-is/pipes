import assert from "node:assert";
import { test } from "node:test";

import { onCleanup } from "./cleanup.js";

/**
 * We only can do two tests! HAHA!
 */

test("onCleanup should when end of scope", () => {
  let x = 0;
  const fn = () => {
    using _ble = onCleanup(() => (x = 2));
  };
  fn();
  assert(x === 2);
});
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
