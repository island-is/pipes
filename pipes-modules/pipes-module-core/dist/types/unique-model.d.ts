import type { AnyModule, ModuleName, moduleNameToString } from "./module.js";
export type IsUnique<T extends {
    ModuleName: ModuleName;
}, A extends {
    ModuleName: ModuleName;
}[], ModuleNames = moduleNameToString<A[number]["ModuleName"]>> = moduleNameToString<T["ModuleName"]> extends ModuleNames ? false : true;
export type UniqueModules<T extends {
    ModuleName: ModuleName;
}[]> = T extends [infer _Head] ? T : T extends [infer Head, ...infer Tail] ? Head extends AnyModule ? Tail extends AnyModule[] ? IsUnique<Head, Tail> extends false ? never : UniqueModules<Tail> extends Tail ? T : never : never : never : never;
