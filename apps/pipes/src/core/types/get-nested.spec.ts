import { describe, it } from "node:test";

import { expect } from "./expect.js";

import type { getNestedObject, isNestedKey } from "./get-nested.js";

describe("get nested", () => {
  it("level 1", () => {
    type wow = {
      key: string;
      value: string;
      endOfTheWorld: "no";
    };
    type _test1 = "incorrectKey" extends isNestedKey<wow, "incorrectKey"> ? true : false;
    // @ts-expect-error wrong key
    const _TEST1: _test1 = true;
    type _test2 = "value" extends isNestedKey<wow, "value"> ? true : false;
    const _TEST2: _test2 = true;
    type _test3 = "no" extends getNestedObject<wow, "endOfTheWorld"> ? true : false;
    const _TEST3: _test3 = true;
  });
  it("level 2", () => {
    type wow = {
      key: string;
      value: string;
      itIsThe: {
        endOfTheWorld: "no";
      };
      endOfTheWorld: "no";
    };
    type _test1 = "itIsThe.haha" extends isNestedKey<wow, "itIsThe.haha"> ? true : false;
    // @ts-expect-error wrong key
    const _TEST1: _test1 = true;
    type _test2 = "itIsThe.endOfTheWorld" extends isNestedKey<wow, "itIsThe.endOfTheWorld"> ? true : false;
    const _TEST2: _test2 = true;
    type _test3 = "no" extends getNestedObject<wow, "itIsThe.endOfTheWorld"> ? true : false;
    const _TEST3: _test3 = true;
    expect(true).toBe(true);
  });
  it("level 3", () => {
    type wow = {
      key: string;
      value: string;
      itIsThe: {
        endOfTheWorld: {
          asWeKnowIt: "I feel fine";
        };
      };
    };
    type _test1 = "itIsThe.endOfTheWorld.hehe" extends isNestedKey<wow, "itIsThe.endOfTheWorld.hehe"> ? true : false;
    // @ts-expect-error wrong key
    const _TEST1: _test1 = true;
    type _test2 = "itIsThe.endOfTheWorld.asWeKnowIt" extends isNestedKey<wow, "itIsThe.endOfTheWorld.asWeKnowIt">
      ? true
      : false;
    const _TEST2: _test2 = true;
    type _test3 = "I feel fine" extends getNestedObject<wow, "itIsThe.endOfTheWorld.asWeKnowIt"> ? true : false;
    const _TEST3: _test3 = true;
    expect(true).toBe(true);
  });
});
