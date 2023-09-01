import { Client, Container } from '@dagger.io/dagger';
export * from '@dagger.io/dagger';
import { ZodType, z, util, ZodDefault, ZodNull, ZodBoolean, ZodLiteral, ZodTuple, ZodArray, ZodDate, ZodString, ZodNumber, ZodVoid, ZodObject, ZodTypeAny, ZodLazy, ZodOptional, ZodUnion } from 'zod';
export { z } from 'zod';

type ExtendType<T extends Record<string, any>> = Record<string, any> & T;

type addParameters<fn extends (...args: any[]) => any, context, config> = fn extends (...args: infer P) => infer R ? (context: context, config: config, ...args: P) => R : never;

type ifIsNotZero<T extends number, If, Else> = 0 extends T ? Else : If;

type changeFunctionToPipes<fn extends (...args: any[]) => any> = fn extends (...args: infer P) => infer R ? {
    (...args: P): R;
} & PipesContextCommandBase : never;

type isNestedKey<Module extends Record<string, any>, Key extends string, AddKey extends string = ""> = Key extends keyof Module ? `${AddKey}${Key}` : Key extends `${infer First}.${infer Rest}` ? First extends keyof Module ? isNestedKey<Module[First], Rest, `${AddKey}${First}.`> : never : never;
type getNestedObject<Module extends Record<string, any>, Key extends string, AddKey extends string = ""> = Key extends keyof Module ? Module[Key] : Key extends `${infer First}.${infer Rest}` ? First extends keyof Module ? getNestedObject<Module[First], Rest, `${AddKey}${First}.`> : never : never;

type Simplify<T> = {
    [KeyType in keyof T]: T[KeyType];
} & {};

type SubsetKeys<T, U extends T> = {
    [K in keyof U]: K extends keyof T ? T[K] : never;
};

type unionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type isTrueOnly<T> = [T] extends [true] ? true : false;
type isFalseOnly<T> = [T] extends [false] ? true : false;
type isTrueAndFalse<T, X = isTrueOnly<T>, Y = isFalseOnly<T>> = T extends boolean ? [X, Y] extends [false, false] ? true : false : false;

type combineNullUndefined<T> = T extends null | undefined ? null : T;

type ArrayItem<T extends any[]> = T[number];
type GenericArray<T extends any[]> = Array<ArrayItem<T>>;

declare type Boolean = 0 | 1;

declare type If<B extends Boolean, Then, Else = never> = B extends 1 ? Then : Else;

/**
 * Describes the match strategy when matching types
 * * `default`     : `extends->`
 * * `contains->`  : X contains   Y ([[Contains]]<X, Y>)
 * * `extends->`   : X extends    Y ([[Extends]]<X, Y>)
 * * `<-contains`  : Y contains   X ([[Contains]]<Y, X>)
 * * `<-extends`   : Y extends    X ([[Extends]]<Y, X>)
 * * `equals`      : X equals     Y (([[Equals]]<X, Y>))
 */
declare type Match = 'default' | 'contains->' | 'extends->' | '<-contains' | '<-extends' | 'equals';

/**
 * Check whether `A1` is part of `A2` or not. The difference with
 * `extends` is that it forces a [[Boolean]] return.
 * @param A1
 * @param A2
 * @returns [[Boolean]]
 * @example
 * ```ts
 * import {A} from 'ts-toolbelt'
 *
 * type test0 = A.Extends<'a' | 'b', 'b'> // Boolean
 * type test1 = A.Extends<'a', 'a' | 'b'> // True
 *
 * type test2 = A.Extends<{a: string}, {a: any}>      // True
 * type test3 = A.Extends<{a: any}, {a: any, b: any}> // False
 *
 * type test4 = A.Extends<never, never> // False
 * /// Nothing cannot extend nothing, use `A.Equals`
 * ```
 */
declare type Extends<A1 extends any, A2 extends any> = [
    A1
] extends [never] ? 0 : A1 extends A2 ? 1 : 0;

/**
 * Check whether `A1` is equal to `A2` or not.
 * @param A1
 * @param A2
 * @returns [[Boolean]]
 * @example
 * ```ts
 * import {A} from 'ts-toolbelt'
 *
 * type test0 = A.Equals<42 | 0, 42 | 0>                    // true
 * type test1 = A.Equals<{a: string}, {b: string}>          // false
 * type test3 = A.Equals<{a: string}, {readonly a: string}> // false
 * ```
 */
declare type Equals<A1 extends any, A2 extends any> = (<A>() => A extends A2 ? 1 : 0) extends (<A>() => A extends A1 ? 1 : 0) ? 1 : 0;

/**
 * Check whether `A1` is part of `A2` or not. It works like
 * [[Extends]] but [[Boolean]] results are narrowed to [[False]].
 * @param A1
 * @param A2
 * @returns [[Boolean]]
 * @example
 * ```ts
 * type test0 = A.Contains<'a' | 'b', 'b'> // False
 * type test1 = A.Contains<'a', 'a' | 'b'> // True
 *
 * type test2 = A.Contains<{a: string}, {a: string, b: number}> // False
 * type test3 = A.Contains<{a: string, b: number}, {a: string}> // True
 *
 * type test4 = A.Contains<never, never> // False
 * /// Nothing cannot contain nothing, use `A.Equals`
 * ```
 */
declare type Contains<A1 extends any, A2 extends any> = Extends<A1, A2> extends 1 ? 1 : 0;

/**
 * Check whether `A` is similar to `A1` or not. In other words, it is a compact
 * type that bundles [[Equals]], [[Extends]], [[Contains]], comparison types.
 * @param A to be compared
 * @param A1 to compare to
 * @param match (?=`'default'`) to change precision
 * @returns [[Boolean]]
 * @example
 * ```ts
 * import {A} from 'ts-toolbelt'
 *
 * type test0 = A.Is<'a', 'a' | 'b', 'extends->'> // True
 * type test1 = A.Is<'a' | 'b', 'a', 'extends->'> // Boolean
 *
 * type test2 = A.Is<'a', 'a' | 'b', '<-extends'> // Boolean
 * type test3 = A.Is<'a' | 'b', 'a', '<-extends'> // True
 *
 * type test4 = A.Is<'a', 'a' | 'b', 'contains->'> // True
 * type test5 = A.Is<'a' | 'b', 'a', 'contains->'> // False
 *
 * type test6 = A.Is<'a', 'a' | 'b', '<-contains'> // False
 * type test7 = A.Is<'a' | 'b', 'a', '<-contains'> // True
 *
 * type test8 = A.Is<'a', 'a' | 'b', 'equals'>      // False
 * type test9 = A.Is<'b' |'a', 'a' | 'b', 'equals'> // True
 * ```
 */
declare type Is<A extends any, A1 extends any, match extends Match = 'default'> = {
    'default': Extends<A, A1>;
    'contains->': Contains<A, A1>;
    'extends->': Extends<A, A1>;
    '<-contains': Contains<A1, A>;
    '<-extends': Extends<A1, A>;
    'equals': Equals<A1, A>;
}[match];

type isAny<T> = If<Is<T, any, "equals">, 1, 0>;

/**
 * A [[List]]
 * @param A its type
 * @returns [[List]]
 * @example
 * ```ts
 * type list0 = [1, 2, 3]
 * type list1 = number[]
 * ```
 */
declare type List<A = any> = ReadonlyArray<A>;

/**
 * Get the length of `L`
 * @param L to get length
 * @returns [[String]] or `number`
 * @example
 * ```ts
 * ```
 */
declare type Length<L extends List> = L['length'];

/**
 * Remove `M` out of `U`
 * @param U to remove from
 * @param M to remove out
 * @returns [[Union]]
 * @example
 * ```ts
 * ```
 */
declare type Exclude$1<U extends any, M extends any> = U extends M ? never : U;

type isEmptyList<T extends List<any>, X extends List<any> = Exclude$1<T, boolean>, XLength = Length<X>> = XLength extends 0 ? true : false;

/**
 * Transform a [[Union]] to an * *intersection**
 * @param U to transform
 * @returns `&`
 * @example
 * ```ts
 * ```
 */
declare type IntersectOf<U extends any> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

/**
 * Get the last item within an [[Union]]
 * (⚠️ it might not preserve order)
 * @param U
 * @returns [[Any]]
 * @example
 * ```ts
 * ```
 */
declare type Last<U extends any> = IntersectOf<U extends unknown ? (x: U) => void : never> extends (x: infer P) => void ? P : never;

/**
 * Add an element `A` at the beginning of `L`
 * @param L to append to
 * @param A to be added to
 * @returns [[List]]
 * @example
 * ```ts
 * ```
 */
declare type Prepend<L extends List, A extends any> = [
    A,
    ...L
];

/**
 * Ask TS to re-check that `A1` extends `A2`.
 * And if it fails, `A2` will be enforced anyway.
 * Can also be used to add constraints on parameters.
 * @param A1 to check against
 * @param A2 to cast to
 * @returns `A1 | A2`
 * @example
 * ```ts
 * import {A} from 'ts-toolbelt'
 *
 * type test0 = A.Cast<'42', string> // '42'
 * type test1 = A.Cast<'42', number> // number
 * ```
 */
declare type Cast<A1 extends any, A2 extends any> = A1 extends A2 ? A1 : A2;

/**
 * @hidden
 */
declare type _ListOf<U, LN extends List = [], LastU = Last<U>> = {
    0: _ListOf<Exclude$1<U, LastU>, Prepend<LN, LastU>>;
    1: LN;
}[Extends<[U], [never]>];
/**
 * Transform a [[Union]] into a [[List]]
 * (⚠️ it might not preserve order)
 * @param U to transform
 * @returns [[List]]
 * @example
 * ```ts
 * ```
 */
declare type ListOf<U extends any> = _ListOf<U> extends infer X ? Cast<X, List> : never;

type LiteralToArray<T> = ListOf<T>;
type hasManyItems<InitalType, T = combineNullUndefined<InitalType>, ListArray extends List<any> = LiteralToArray<T>, ListLength = Length<ListArray>, IsModuleName extends boolean = InitalType extends string & {
    __type: "modulename";
} ? true : false, Bool = isEmptyList<LiteralToArray<Exclude$1<T, boolean>>>> = IsModuleName extends true ? false : Bool extends true ? false : ListLength extends 1 ? false : true;

type isTuple<T> = T extends [infer _X, ...infer _XS] ? true : false;

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
declare function createZodStore<T extends StoreObj = StoreObj, Output = DefaultOutput<T>>(obj: T, skip?: Skips<T>): Output;
type DefaultWrapOutput<T extends StoreObj> = {
    [K in keyof T]: T[K] extends z.ZodType<any> ? z.infer<T[K]> : T[K] extends (arg1: any, arg2: any, ...arg: infer Arg) => infer X ? Arg["length"] extends 0 | undefined ? () => X : (arg: Arg[0]) => X : T[K] extends (arg1: any, arg2: any) => infer X ? () => X : T[K];
};
declare const wrapContext: <T extends Record<string, any>, Output = DefaultWrapOutput<T>>(obj: T, config: Record<string, any>, stack?: string[]) => Output;
declare const createZodKeyStore: <T extends ZodType<any, z.ZodTypeDef, any>>(type: T) => {
    awaitForAvailability(key: string): Promise<z.TypeOf<T>>;
    getKey(key: string): Promise<z.TypeOf<T> | null>;
    setKey(key: string, value: z.TypeOf<T>): Promise<void>;
    getOrSet(key: string, fn: () => z.TypeOf<T> | Promise<z.TypeOf<T>>): Promise<z.TypeOf<T>>;
};
declare const createGlobalZodKeyStore: <T extends ZodType<any, z.ZodTypeDef, any>>(obj: T, key: string) => Promise<{
    awaitForAvailability(key: string): Promise<z.TypeOf<T>>;
    getKey(key: string): Promise<z.TypeOf<T> | null>;
    setKey(key: string, value: z.TypeOf<T>): Promise<void>;
    getOrSet(key: string, fn: () => z.TypeOf<T> | Promise<z.TypeOf<T>>): Promise<z.TypeOf<T>>;
}>;

interface DefaultProps {
    env?: string;
    variables?: string;
    arg?: {
        short?: string | undefined;
        long: string;
        positional?: boolean;
    };
}
declare module "zod" {
    interface ZodType<Output = any, Def extends z.ZodTypeDef = z.ZodTypeDef, Input = Output> {
        default(def?: util.noUndefined<Input>, options?: DefaultProps): ZodDefault<this>;
        default(def?: () => util.noUndefined<Input>, options?: DefaultProps): ZodDefault<this>;
    }
}

/**
 * Logical `&&` operator (behaves like the JS one)
 * @param B1 Left-hand side
 * @param B2 Right-hand side
 * @returns [[Boolean]]
 * @example
 * ```ts
 * import {B} from 'ts-toolbelt'
 *
 * type test0 = B.And<B.True, B.False>          // False
 * type test1 = B.And<B.True, B.True>           // True
 * type test2 = B.And<B.True | B.False, B.True> // Boolean
 * ```
 */
declare type And<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 0;
    };
    1: {
        0: 0;
        1: 1;
    };
}[B1][B2];

/**
 * Logical `||` operator (behaves like the JS one)
 * @param B1 Left-hand side
 * @param B2 Right-hand side
 * @returns [[Boolean]]
 * @example
 * ```ts
 * import {B} from 'ts-toolbelt'
 *
 * type test0 = B.Or<B.True, B.False>    // True
 * type test1 = B.Or<B.True, B.True>     // True
 * type test2 = B.Or<B.Boolean, B.False> // Boolean
 * ```
 */
declare type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];

/**
 * @hidden
 */
declare type IsStringLiteral<A extends any> = A extends string ? string extends A ? 0 : 1 : 0;
/**
 * @hidden
 */
declare type IsNumberLiteral<A extends any> = A extends number ? number extends A ? 0 : 1 : 0;
/**
 * Literal to restrict against
 */
declare type Kind = string | number;
/**
 * Determine whether `A` is literal or not
 * @param A to be checked
 * @param kind (?=`'string' | 'number'`) to restrict
 * @example
 * ```ts
 * import {A} from 'ts-toolbelt'
 *
 * type test0 = A.IsLiteral<1 | 2> // 1
 * type test1 = A.IsLiteral<1 | 2, string> // 0
 * type test2 = A.IsLiteral<1 | '2', string> // 0 | 1
 * type test3 = A.IsLiteral<number> // 0
 * ```
 */
declare type IsLiteral<A extends any, kind extends Kind = Kind> = And<Or<IsStringLiteral<A>, IsNumberLiteral<A>>, Extends<A, kind>>;

type ArrayToZod<T extends Readonly<any[]>> = {
    [K in keyof T]: valueToZod<T[K]>;
};
type ArrayToZodArray<U extends Readonly<List<any>>, AddUnion = 1, length extends number = Length<U>, head = U[0]> = length extends 1 ? valueToZod<head> : U extends [...infer R, null] ? ZodOptional<ArrayToZodArray<R>> | ZodDefault<ZodOptional<ArrayToZodArray<R>>> : U extends [null, ...infer R] ? ZodOptional<ArrayToZodArray<R>> | ZodDefault<ZodOptional<ArrayToZodArray<R>>> : AddUnion extends 1 ? ZodDefault<ZodUnion<GenericArray<ArrayToZod<U>>>> : ZodType<U> | ArrayToZod<U>;
type ValueToZodArray<T, AddUnion = 1, U extends List<any> = ListOf<combineNullUndefined<T>>> = ArrayToZodArray<U, AddUnion>;
type List2Tuple<L> = L extends [infer Head, ...infer Tail] ? [valueToZod<Head>, ...List2Tuple<Tail>] : L extends [infer Head] ? [valueToZod<Head>] : [];
type zodDefault<T extends ZodTypeAny> = ZodDefault<T> | T;
type zodLazy<T extends ZodTypeAny> = ZodLazy<T> | T;
type valueToZod<T> = {
    modulename: ZodType<ModuleName> | ZodDefault<ZodType<ModuleName>>;
    many: ValueToZodArray<T>;
    nullOrUndefined: zodDefault<ZodNull> | ZodNull;
    boolean: zodDefault<ZodBoolean> | ZodBoolean;
    true: zodDefault<ZodLiteral<true>> | ZodLiteral<true>;
    false: zodDefault<ZodLiteral<false>> | ZodLiteral<false>;
    literal: ZodLiteral<T>;
    tuple: T extends Array<infer _U> ? ZodTuple<List2Tuple<T>> : never;
    array: T extends Array<infer U> ? ZodArray<valueToZod<U>> | ZodDefault<ZodArray<valueToZod<U>>> : never;
    date: zodDefault<ZodDate> | ZodDate;
    string: zodDefault<ZodString> | ZodString;
    number: zodDefault<ZodNumber> | ZodNumber;
    void: ZodVoid;
    object: ZodType<T> | zodLazy<ZodObject<{
        [k in keyof T]: valueToZod<T[k]>;
    }, "strip"> | ZodType<T>> | zodDefault<zodLazy<ZodObject<{
        [k in keyof T]: valueToZod<T[k]>;
    }, "strip"> | ZodType<T>>>;
    unknown: never;
}[zodKey<T>];
type zodKey<T> = true extends If<isAny<T>, true> ? "unknown" : true extends If<Is<T, never, "equals">, true> ? "unknown" : true extends hasManyItems<T> ? "many" : true extends If<Is<T, null | undefined, "extends->">, true> ? "nullOrUndefined" : true extends isTrueAndFalse<T> ? "boolean" : true extends isTrueOnly<T> ? "true" : true extends isFalseOnly<T> ? "false" : T extends string & {
    __type: "modulename";
} ? "modulename" : true extends If<IsLiteral<T>, true> ? "literal" : T extends any[] ? isTuple<T> extends true ? "tuple" : "array" : true extends If<Is<T, Date, "equals">, true> ? "date" : true extends If<Is<T, string, "equals">, true> ? "string" : true extends If<Is<T, number, "equals">, true> ? "number" : true extends If<Is<T, void, "equals">, true> ? "void" : T extends {
    [k: string]: any;
} ? "object" : "unknown";

type withoutNever<T> = {
    [P in keyof T as T[P] extends never ? never : P]: T[P];
};

type CreateModule<Name extends ModuleName, Definition, Config extends ModuleConfigValue<Config>, RequiredModules extends AnyModule[] = [], OptionalModules extends AnyModule[] = [], MergedInterface extends ModuleContextInterface<MergedInterface> = MergeOutsideInterface<Definition, RequiredModules, OptionalModules>, MergedConfig extends Config = MergeConfig<Config, RequiredModules, OptionalModules>, NewConfig extends AnyModuleConfig = ModuleConfig<Config, MergedConfig, getConfigImplementation<Config>, getConfigImplementation<MergedConfig>>, OutsideInterface extends ModuleOutsideInterface<MergedInterface> = getOutSideInterface<MergedInterface, MergedConfig>, MergedImplement = getImplementation<OutsideInterface, OutsideInterface>, Implementation extends SubsetKeys<OutsideInterface, Implementation> = getImplementation<OutsideInterface, Definition>, NewContext = ModuleContext<Definition, MergedInterface, OutsideInterface, Implementation, MergedImplement>> = Module<Name, Definition, NewConfig, NewContext, RequiredModules, OptionalModules>;
type newModuleName<T> = T;
type moduleNameToString<T> = T;
type ModuleConfigValue<T> = Record<keyof T, Exclude<any, Function>>;
type AnyModuleConfig = ModuleConfig<any, any, any, any>;
type ModuleConfig<Config extends ModuleConfigValue<Config>, MergedConfig extends Config = Config, Implement = Config, MergedImplement = Config> = {
    Merged: MergedConfig;
    MergedImplement: MergedImplement;
    Incoming: Config;
    Implement: Implement;
};
type ModuleContextInterface<T> = Record<keyof T, any>;
type ModuleOutsideInterface<ContextInterface extends ModuleContextInterface<ContextInterface>> = Record<keyof ContextInterface, any>;
type ModuleContext<Incoming, ContextInterface extends ModuleContextInterface<ContextInterface> = Incoming, OutsideInterface extends ModuleOutsideInterface<ContextInterface> = ContextInterface, Implement extends SubsetKeys<ContextInterface, Implement> = ContextInterface, MergedImplement = OutsideInterface> = {
    Incoming: Incoming;
    ContextInterface: ContextInterface;
    OutsideInterface: OutsideInterface;
    Implement: Implement;
    MergedImplement: MergedImplement;
};
type ModuleName = string;
type AnyModule = Module<any, any, any, any, any, any>;
type Module<Name extends ModuleName, Definition, Config extends AnyModuleConfig, Context, RequiredModules extends AnyModule[] = [], OptionalModules extends AnyModule[] = []> = {
    ModuleName: Name;
    Config: Config;
    Context: Context;
    Definition: Definition;
    RequiredModules: RequiredModules;
    OptionalModules: OptionalModules;
};
type FunctionKeys<T> = {
    [K in keyof T]: string extends K ? never : T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];
type NonFunctionKeys<T> = {
    [K in keyof T]: string extends K ? never : T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];
type ReplaceFunctionKeys<T, Context, Config> = {
    [K in FunctionKeys<T>]: T[K] extends (...args: any[]) => any ? changeFunctionToPipes<addParameters<T[K], Context, Config>> : never;
} & {
    [K in NonFunctionKeys<T>]: T[K] extends (...args: any[]) => any ? never : T[K];
};
type ReplaceImplementation<T> = {
    [K in NonFunctionKeys<T>]: string extends K ? never : T[K] extends (...args: any[]) => any ? never : valueToZod<T[K]> | T[K];
} & {
    [K in FunctionKeys<T>]: string extends K ? never : T[K] extends (...args: any[]) => any ? T[K] : never;
};
type ReplaceConfigImplementation<T> = {
    [K in NonFunctionKeys<T>]: T[K] extends (...args: any[]) => any ? never : valueToZod<T[K]> | T[K];
} & {
    [K in FunctionKeys<T>]: T[K] extends (...args: any[]) => any ? never : never;
};
type getConfigImplementation<T> = Simplify<withoutNever<ReplaceConfigImplementation<T>>>;
type getOutSideInterface<T extends ModuleContextInterface<T>, Config> = ReplaceFunctionKeys<T, T, Config> extends ModuleOutsideInterface<T> ? ReplaceFunctionKeys<T, T, Config> : never;
type getImplementation<T extends ModuleContextInterface<T>, K extends SubsetKeys<T, K>> = withoutNever<ReplaceImplementation<SubsetKeys<T, K>>>;
type MergeStateHelper<Definition extends string, NewState, PrevModules extends AnyModule[] = [], PossibleModules extends AnyModule[] = []> = Definition extends isNestedKey<AnyModule, Definition> ? Simplify<unionToIntersection<NewState & withoutNever<ifIsNotZero<PossibleModules["length"], ifIsNotZero<PrevModules["length"], Omit<Partial<getNestedObject<PossibleModules[number], Definition>>, keyof getNestedObject<PrevModules[number], Definition>>, Partial<getNestedObject<PossibleModules[number], Definition>>>, NewState> & ifIsNotZero<PrevModules["length"], getNestedObject<PrevModules[number], Definition>, NewState>>>> : never;
type MergeOutsideInterface<NewState, PrevModules extends AnyModule[] = [], PossibleModules extends AnyModule[] = [], MergedState = MergeStateHelper<"Definition", NewState, PrevModules, PossibleModules>> = MergedState extends ModuleOutsideInterface<NewState> ? MergedState : never;
type MergeConfig<NewState extends Record<string, any>, PrevModules extends AnyModule[] = [], PossibleModules extends AnyModule[] = [], MergedState = MergeStateHelper<"Config.Incoming", NewState, PrevModules, PossibleModules>> = MergedState extends NewState ? MergedState : never;
type MergeModules<PrevModules extends AnyModule[] = [], MergedConfig = PrevModules extends [infer X, ...infer R] ? X extends AnyModule ? R extends AnyModule[] ? MergeStateHelper<"Config.Incoming", X["Config"]["Incoming"], R, []> : never : never : PrevModules extends [infer X] ? X extends AnyModule ? MergeStateHelper<"Config.Incoming", X["Config"]["Incoming"], [], []> : never : never, MergedContext = PrevModules extends [infer X, ...infer R] ? X extends AnyModule ? R extends AnyModule[] ? MergeStateHelper<"Context.Incoming", X["Context"]["Incoming"], R, []> : never : never : PrevModules extends [infer X] ? X extends AnyModule ? MergeStateHelper<"Context.Incoming", X["Context"]["Incoming"], [], []> : never : never, Name extends newModuleName<"CurrentState"> = newModuleName<"CurrentState">> = CreateModule<Name, MergedContext, MergedConfig>;

declare const PipesContextCommandSymbol: unique symbol;
type PipesContextCommandImplementation<Context extends Record<string, any>, Config extends Record<string, any>, Value, Output> = Value extends undefined ? (context: ExtendType<Context>, config: ExtendType<Config>) => Output : (context: ExtendType<Context>, config: ExtendType<Config>, value: Value) => Output;
type PipesContextCommandBase = {
    _isPipesCommand: true;
    _fn: any;
    _wrapper: (fn: any) => any;
    _implement: any;
    [PipesContextCommandSymbol]?: never;
};
type PipesContextCommand<Module extends AnyModule, Value, Output> = PipesContextCommandBase & PipesContextCommandImplementation<Module["Context"]["ContextInterface"], Module["Config"]["Merged"], Value, Output>;

declare const createPipesContextCommand: <BaseModule extends Module<any, any, any, any, any, any>, Value = undefined, Output = undefined, _BaseContext extends ModuleContext<any, any, any> = BaseModule["Context"], BaseContext extends ModuleContextInterface<BaseContext> = _BaseContext["ContextInterface"], _BaseConfig extends ModuleConfig<any, any, any> = BaseModule["Config"], BaseConfig extends ModuleConfigValue<BaseConfig> = _BaseConfig["Merged"], ValueSchema extends valueToZod<Value> | undefined = undefined extends Value ? undefined : valueToZod<Value>, OutputSchema extends valueToZod<Output> = valueToZod<Output>>({ value, output, implement, }: {
    value?: ValueSchema | undefined;
    output?: OutputSchema | undefined;
    implement: (context: BaseContext, config: BaseConfig, _value: Value) => Output;
}) => PipesContextCommand<BaseModule, Value, Output>;

declare function createConfig<Module extends AnyModule, ConfigImplement = Module["Config"]["Implement"]>(fn: (prop: {
    z: typeof z;
}) => ConfigImplement): (prop: {
    z: typeof z;
}) => ConfigImplement;
declare function createContext<Module extends AnyModule, ContextImplement = Module["Context"]["Implement"]>(fn: (prop: {
    z: typeof z;
    fn: <Value = undefined, Output = undefined>(props: Parameters<typeof createPipesContextCommand<Module, Value, Output>>[0]) => ReturnType<typeof createPipesContextCommand<Module, Value, Output>>;
}) => ContextImplement): typeof fn;
declare function createModule<NewModule extends AnyModule, ConfigImplement = NewModule["Config"]["Implement"], ContextImplement = NewModule["Context"]["Implement"], RequiredNames extends ModuleName[] = NewModule["RequiredModules"][number]["ModuleName"] extends never ? [] : moduleNameToString<NewModule["RequiredModules"][number]["ModuleName"]>[], OptionalNames extends ModuleName[] = NewModule["OptionalModules"][number]["ModuleName"] extends never ? [] : moduleNameToString<NewModule["OptionalModules"][number]["ModuleName"]>[]>(param: {
    name: moduleNameToString<NewModule["ModuleName"]>;
    config: (value: {
        z: typeof z;
    }) => ConfigImplement;
    context: (value: {
        z: typeof z;
        fn: <Value = undefined, Output = undefined>(props: Parameters<typeof createPipesContextCommand<NewModule, Value, Output>>[0]) => ReturnType<typeof createPipesContextCommand<NewModule, Value, Output>>;
    }) => ContextImplement;
    required?: RequiredNames;
    optional?: OptionalNames;
}): {
    name: NewModule["ModuleName"];
    config: ConfigImplement;
    context: ContextImplement;
    required: RequiredNames;
    optional: OptionalNames;
};
type createModuleDef<Name extends string, Definition, Config extends ModuleConfigValue<Config>, RequiredModules extends AnyModule[] = [], OptionalModules extends AnyModule[] = []> = CreateModule<newModuleName<Name>, Definition, Config, RequiredModules, OptionalModules>;

interface IPipesCoreContext {
    client: Client;
    haltAll: () => void;
    modules: ModuleName[];
    stack: string[];
    hasModule: <Module extends AnyModule>(name: moduleNameToString<Module["ModuleName"]>) => boolean;
    imageStore: Promise<ReturnType<typeof createZodKeyStore<z.ZodType<Container>>>>;
    addEnv: (prop: {
        container: Container;
        env: [string, string][];
    }) => Container;
}
interface IPipesCoreConfig {
    appName: string;
    isCI: boolean;
    isPR: boolean;
    env: "github" | "gitlab" | "local";
}
type PipesCoreModule = createModuleDef<"PipesCore", IPipesCoreContext, IPipesCoreConfig>;

declare class PipesCoreClass<Modules extends AnyModule[] = [PipesCoreModule], CurrentState extends MergeModules<Modules> = MergeModules<Modules>, CurrentConfig extends CurrentState["Config"] = CurrentState["Config"], CurrentContext extends CurrentState["Context"] = CurrentState["Context"], ScriptFn extends fn$1<CurrentContext["ContextInterface"], CurrentConfig["Merged"]> = fn$1<CurrentContext["ContextInterface"], CurrentConfig["Merged"]>> {
    #private;
    addScript(fn: ScriptFn): this;
    set haltAll(value: () => void | Promise<void>);
    get haltAll(): () => void;
    config: CurrentConfig["Merged"];
    context: {
        [key in keyof CurrentContext["OutsideInterface"]]: CurrentContext["OutsideInterface"][key] extends PipesContextCommandBase ? Diff<CurrentContext["OutsideInterface"][key], PipesContextCommandBase> : CurrentContext["OutsideInterface"][key];
    };
    constructor({ modules, schemas: { config, context }, }: {
        modules: ModuleName[];
        schemas: {
            config: CurrentConfig["MergedImplement"];
            context: CurrentContext["MergedImplement"];
        };
    });
    get isReady(): boolean;
    get modules(): ModuleName[];
    hasModule(moduleName: string): boolean;
    addModule<T extends AnyModule>(module: ModuleReturnType<T>): PipesCoreClass<[T, ...Modules]>;
    set client(client: Client);
    get client(): Client;
    run(): Promise<void>;
}
declare const createPipesCore: () => PipesCoreClass<[PipesCoreModule]>;
declare const ContextHasModule: <T extends unknown, K extends keyof T, Context extends Partial<T>>(context: unknown, key: K) => context is Required<Pick<Context, keyof T>> & Omit<Context, keyof T> extends infer T_1 ? { [KeyType_1 in keyof T_1]: (Required<Pick<Context, keyof T>> & Omit<Context, keyof T>)[KeyType_1]; } : never;
declare const ConfigHasModule: <T extends unknown, K extends keyof T, Config extends Partial<T>>(config: unknown, key: K) => config is Required<Pick<Config, keyof T>> & Omit<Config, keyof T> extends infer T_1 ? { [KeyType_1 in keyof T_1]: (Required<Pick<Config, keyof T>> & Omit<Config, keyof T>)[KeyType_1]; } : never;
type ModuleReturnType<NewModule extends AnyModule> = {
    name: NewModule["ModuleName"];
    config: NewModule["Config"]["Implement"];
    context: NewModule["Context"]["Implement"];
    required: NewModule["RequiredModules"][number]["ModuleName"] extends never ? [] : NewModule["RequiredModules"][number]["ModuleName"][];
    optional: NewModule["OptionalModules"][number]["ModuleName"] extends never ? [] : NewModule["OptionalModules"][number]["ModuleName"][];
};
type fn$1<Context extends any, Config extends any> = (context: Context, config: Config) => Promise<void> | void;
type Diff<T, U> = T extends any & U ? (T extends infer R & U ? R : never) : never;

declare class PipesCoreRunner {
    #private;
    addContext(value: PipesCoreClass): () => void;
    removeContext(value: PipesCoreClass): void;
    run(): Promise<void>;
}
interface CreatePipeProps {
    z: typeof z;
    createPipesCore: typeof createPipesCore;
    createConfig: typeof createConfig;
    createModule: typeof createModule;
    createContext: typeof createContext;
    contextHasModule: typeof ContextHasModule;
    configHasModule: typeof ConfigHasModule;
}
interface PipeBase {
    run: () => Promise<any> | any;
    client: Client | null | undefined;
}
declare const createPipe: (fn: ({ z, createPipesCore }: CreatePipeProps) => Promise<PipeBase[]> | PipeBase[]) => Promise<void>;

export { PipesCoreClass, type PipesCoreModule, PipesCoreRunner, type Simplify, createConfig, createContext, createGlobalZodKeyStore, createModule, type createModuleDef, createPipe, createZodStore, wrapContext };
