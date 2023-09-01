import assert from "node:assert";
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function expect(actual) {
    return {
        toBe: (expected)=>{
            assert.strictEqual(actual, expected);
        },
        toBeDefined: ()=>{
            assert.notStrictEqual(actual, undefined);
        },
        toHaveBeenCalled: ()=>{
            assert.strictEqual(actual.calls.length > 0, true);
        },
        toThrow: ()=>{
            assert.throws(actual);
        },
        toStrictEqual: (expected)=>{
            assert.deepStrictEqual(actual, expected);
            assert.strictEqual(actual.constructor, expected.constructor);
        },
        notToBe: (expected)=>{
            assert.notStrictEqual(actual, expected);
        },
        toBeTruthy: ()=>{
            assert(actual);
        },
        toBeFalsy: ()=>{
            assert(!actual);
        },
        toEqual: (expected)=>{
            assert.deepStrictEqual(actual, expected);
        },
        not: {
            toHaveBeenCalled: ()=>{
                assert.strictEqual(actual.calls.length === 0, true);
            },
            toBe: (expected)=>{
                assert.notStrictEqual(actual, expected);
            },
            toEqual: (expected)=>{
                assert.notDeepStrictEqual(actual, expected);
            }
        }
    };
}
