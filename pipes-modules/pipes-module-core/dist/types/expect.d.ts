export declare function expect(actual: any): {
    toBe: (expected: any) => void;
    toBeDefined: () => void;
    toHaveBeenCalled: () => void;
    toThrow: () => void;
    toStrictEqual: (expected: any) => void;
    notToBe: (expected: any) => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toEqual: (expected: any) => void;
    not: {
        toHaveBeenCalled: () => void;
        toBe: (expected: any) => void;
        toEqual: (expected: any) => void;
    };
};
