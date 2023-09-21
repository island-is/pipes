import assert from "node:assert";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function expect(actual: any): {
  toBe: (expected: any) => void;
  toBeDefined: () => void;
  toHaveBeenCalled: () => void;
  toThrow: () => void;
  toStrictEqual: (expected: any) => void;
  notToBe: (expected: any) => void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
  toEqual: (expected: any) => void;
  not: { toHaveBeenCalled: () => void; toBe: (expected: any) => void; toEqual: (expected: any) => void };
} {
  return {
    toBe: (expected: any) => {
      assert.strictEqual(actual, expected);
    },
    toBeDefined: () => {
      assert.notStrictEqual(actual, undefined);
    },
    toHaveBeenCalled: () => {
      assert.strictEqual(actual.calls.length > 0, true);
    },
    toThrow: () => {
      assert.throws(actual);
    },
    toStrictEqual: (expected: any) => {
      assert.deepStrictEqual(actual, expected);
      assert.strictEqual(actual.constructor, expected.constructor);
    },
    notToBe: (expected: any) => {
      assert.notStrictEqual(actual, expected);
    },
    toBeTruthy: () => {
      assert(actual);
    },
    toBeFalsy: () => {
      assert(!actual);
    },
    toEqual: (expected: any) => {
      assert.deepStrictEqual(actual, expected);
    },
    not: {
      toHaveBeenCalled: () => {
        assert.strictEqual(actual.calls.length === 0, true);
      },
      toBe: (expected: any) => {
        assert.notStrictEqual(actual, expected);
      },
      toEqual: (expected: any) => {
        assert.notDeepStrictEqual(actual, expected);
      },
    },
  };
}
