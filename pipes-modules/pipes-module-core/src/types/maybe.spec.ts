import { describe, it } from "node:test";

import { expect } from "./expect.js";

import type { Maybe } from "./maybe.js";

describe("maybe", () => {
  it("maybe", () => {
    type checkIfWorks = Maybe<number> extends null | undefined | number ? true : false;
    const WORKS: checkIfWorks = true;
    expect(WORKS).toBe(true);
  });
});
