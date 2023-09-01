import type { ZodType, z } from "zod";
export declare class MobXStore {
    constructor();
}
type StoreObj = Record<string, z.ZodType<any> | Function>;
interface Skip<T extends StoreObj, key extends keyof T = keyof T> {
    key: keyof T;
    get: () => T[key] extends z.ZodType<any> ? z.infer<T[key]> : T[key];
    set?: (value: T[key] extends z.ZodType<any> ? z.infer<T[key]> : T[key]) => boolean;
}
type Skips<T extends StoreObj> = Skip<T>[];
type DefaultOutput<T extends StoreObj> = {
    [K in keyof T]: T[K] extends z.ZodType<any> ? z.infer<T[K]> : T[K];
};
export declare function createZodStore<T extends StoreObj = StoreObj, Output = DefaultOutput<T>>(obj: T, skip?: Skips<T>): Output;
type DefaultWrapOutput<T extends StoreObj> = {
    [K in keyof T]: T[K] extends z.ZodType<any> ? z.infer<T[K]> : T[K] extends (arg1: any, arg2: any, ...arg: infer Arg) => infer X ? Arg["length"] extends 0 | undefined ? () => X : (arg: Arg[0]) => X : T[K] extends (arg1: any, arg2: any) => infer X ? () => X : T[K];
};
export declare const wrapContext: <T extends Record<string, any>, Output = DefaultWrapOutput<T>>(obj: T, config: Record<string, any>, stack?: string[]) => Output;
export declare const createLockStore: () => {
    isLocked: (key: string) => boolean;
    waitForLock: (key: string) => Promise<void>;
    lock<T extends () => any>(key: string, fn: T): Promise<Awaited<ReturnType<T>>>;
};
export declare const createZodKeyStore: <T extends ZodType<any, z.ZodTypeDef, any>>(type: T) => {
    awaitForAvailability(key: string): Promise<z.TypeOf<T>>;
    getKey(key: string): Promise<z.TypeOf<T> | null>;
    setKey(key: string, value: z.TypeOf<T>): Promise<void>;
    getOrSet(key: string, fn: () => z.TypeOf<T> | Promise<z.TypeOf<T>>): Promise<z.TypeOf<T>>;
};
export declare const createGlobalZodStore: <T extends StoreObj>(obj: T, key: string) => Promise<DefaultOutput<T>>;
export declare const createGlobalZodKeyStore: <T extends ZodType<any, z.ZodTypeDef, any>>(obj: T, key: string) => Promise<{
    awaitForAvailability(key: string): Promise<z.TypeOf<T>>;
    getKey(key: string): Promise<z.TypeOf<T> | null>;
    setKey(key: string, value: z.TypeOf<T>): Promise<void>;
    getOrSet(key: string, fn: () => z.TypeOf<T> | Promise<z.TypeOf<T>>): Promise<z.TypeOf<T>>;
}>;
export {};
