import { Client, Container as Container$1 } from '@dagger.io/dagger';
export * from '@dagger.io/dagger';
import { If } from 'ts-toolbelt/out/Any/If.js';
import { Is } from 'ts-toolbelt/out/Any/Is.js';
import { Length } from 'ts-toolbelt/out/List/Length.js';
import { List as List$1 } from 'ts-toolbelt/out/List/List.js';
import { Exclude as Exclude$1 } from 'ts-toolbelt/out/Union/Exclude.js';
import { ListOf } from 'ts-toolbelt/out/Union/ListOf.js';
import { IsLiteral } from 'ts-toolbelt/out/Community/IsLiteral.js';
import React, { ReactNode, ReactElement } from 'react';
import { ForegroundColorName } from 'chalk';
import { LiteralUnion, Except } from 'type-fest';
import { Boxes, BoxStyle } from 'cli-boxes';
import { Node } from 'yoga-wasm-web/auto';

type ArrayItem<T extends any[]> = T[number];
type GenericArray<T extends any[]> = Array<ArrayItem<T>>;

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

type isAny<T> = If<Is<T, any, "equals">, 1, 0>;

type isEmptyList<T extends List$1<any>, X extends List$1<any> = Exclude$1<T, boolean>, XLength = Length<X>> = XLength extends 0 ? true : false;

type LiteralToArray<T> = ListOf<T>;
type hasManyItems<InitalType, T = combineNullUndefined<InitalType>, ListArray extends List$1<any> = LiteralToArray<T>, ListLength = Length<ListArray>, IsModuleName extends boolean = InitalType extends string & {
    __type: "modulename";
} ? true : false, Bool = isEmptyList<LiteralToArray<Exclude$1<T, boolean>>>> = IsModuleName extends true ? false : Bool extends true ? false : ListLength extends 1 ? false : true;

type isTuple<T> = T extends [infer _X, ...infer _XS] ? true : false;

type Primitive = string | number | symbol | bigint | boolean | null | undefined;
type Scalars = Primitive | Primitive[];

declare namespace util {
    type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? true : false;
    export type isAny<T> = 0 extends 1 & T ? true : false;
    export const assertEqual: <A, B>(val: AssertEqual<A, B>) => AssertEqual<A, B>;
    export function assertIs<T>(_arg: T): void;
    export function assertNever(_x: never): never;
    export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
    export type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;
    export type MakePartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
    export const arrayToEnum: <T extends string, U extends [T, ...T[]]>(items: U) => { [k in U[number]]: k; };
    export const getValidEnumValues: (obj: any) => any[];
    export const objectValues: (obj: any) => any[];
    export const objectKeys: ObjectConstructor["keys"];
    export const find: <T>(arr: T[], checker: (arg: T) => any) => T | undefined;
    export type identity<T> = objectUtil.identity<T>;
    export type flatten<T> = objectUtil.flatten<T>;
    export type noUndefined<T> = T extends undefined ? never : T;
    export const isInteger: NumberConstructor["isInteger"];
    export function joinValues<T extends any[]>(array: T, separator?: string): string;
    export const jsonStringifyReplacer: (_: string, value: any) => any;
    export {  };
}
declare namespace objectUtil {
    export type MergeShapes<U, V> = {
        [k in Exclude<keyof U, keyof V>]: U[k];
    } & V;
    type requiredKeys<T extends object> = {
        [k in keyof T]: undefined extends T[k] ? never : k;
    }[keyof T];
    export type addQuestionMarks<T extends object, R extends keyof T = requiredKeys<T>> = Pick<Required<T>, R> & Partial<T>;
    export type identity<T> = T;
    export type flatten<T> = identity<{
        [k in keyof T]: T[k];
    }>;
    export type noNeverKeys<T> = {
        [k in keyof T]: [
            T[k]
        ] extends [
            never
        ] ? never : k;
    }[keyof T];
    export type noNever<T> = identity<{
        [k in noNeverKeys<T>]: k extends keyof T ? T[k] : never;
    }>;
    export const mergeShapes: <U, T>(first: U, second: T) => T & U;
    export type extendShape<A, B> = flatten<Omit<A, keyof B> & B>;
    export {  };
}
declare const ZodParsedType: {
    string: "string";
    number: "number";
    bigint: "bigint";
    boolean: "boolean";
    symbol: "symbol";
    undefined: "undefined";
    object: "object";
    function: "function";
    map: "map";
    nan: "nan";
    integer: "integer";
    float: "float";
    date: "date";
    null: "null";
    array: "array";
    unknown: "unknown";
    promise: "promise";
    void: "void";
    never: "never";
    set: "set";
};
type ZodParsedType = keyof typeof ZodParsedType;
declare const getParsedType: (data: any) => ZodParsedType;

type allKeys<T> = T extends any ? keyof T : never;
type inferFlattenedErrors<T extends ZodType<any, any, any>, U = string> = typeToFlattenedError<TypeOf<T>, U>;
type typeToFlattenedError<T, U = string> = {
    formErrors: U[];
    fieldErrors: {
        [P in allKeys<T>]?: U[];
    };
};
declare const ZodIssueCode: {
    invalid_type: "invalid_type";
    invalid_literal: "invalid_literal";
    custom: "custom";
    invalid_union: "invalid_union";
    invalid_union_discriminator: "invalid_union_discriminator";
    invalid_enum_value: "invalid_enum_value";
    unrecognized_keys: "unrecognized_keys";
    invalid_arguments: "invalid_arguments";
    invalid_return_type: "invalid_return_type";
    invalid_date: "invalid_date";
    invalid_string: "invalid_string";
    too_small: "too_small";
    too_big: "too_big";
    invalid_intersection_types: "invalid_intersection_types";
    not_multiple_of: "not_multiple_of";
    not_finite: "not_finite";
};
type ZodIssueCode = keyof typeof ZodIssueCode;
type ZodIssueBase = {
    path: (string | number)[];
    message?: string;
};
interface ZodInvalidTypeIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_type;
    expected: ZodParsedType;
    received: ZodParsedType;
}
interface ZodInvalidLiteralIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_literal;
    expected: unknown;
    received: unknown;
}
interface ZodUnrecognizedKeysIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.unrecognized_keys;
    keys: string[];
}
interface ZodInvalidUnionIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_union;
    unionErrors: ZodError[];
}
interface ZodInvalidUnionDiscriminatorIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_union_discriminator;
    options: Primitive[];
}
interface ZodInvalidEnumValueIssue extends ZodIssueBase {
    received: string | number;
    code: typeof ZodIssueCode.invalid_enum_value;
    options: (string | number)[];
}
interface ZodInvalidArgumentsIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_arguments;
    argumentsError: ZodError;
}
interface ZodInvalidReturnTypeIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_return_type;
    returnTypeError: ZodError;
}
interface ZodInvalidDateIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_date;
}
type StringValidation = "email" | "url" | "emoji" | "uuid" | "regex" | "cuid" | "cuid2" | "ulid" | "datetime" | "ip" | {
    includes: string;
    position?: number;
} | {
    startsWith: string;
} | {
    endsWith: string;
};
interface ZodInvalidStringIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_string;
    validation: StringValidation;
}
interface ZodTooSmallIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.too_small;
    minimum: number | bigint;
    inclusive: boolean;
    exact?: boolean;
    type: "array" | "string" | "number" | "set" | "date" | "bigint";
}
interface ZodTooBigIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.too_big;
    maximum: number | bigint;
    inclusive: boolean;
    exact?: boolean;
    type: "array" | "string" | "number" | "set" | "date" | "bigint";
}
interface ZodInvalidIntersectionTypesIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_intersection_types;
}
interface ZodNotMultipleOfIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.not_multiple_of;
    multipleOf: number | bigint;
}
interface ZodNotFiniteIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.not_finite;
}
interface ZodCustomIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params?: {
        [k: string]: any;
    };
}
type DenormalizedError = {
    [k: string]: DenormalizedError | string[];
};
type ZodIssueOptionalMessage = ZodInvalidTypeIssue | ZodInvalidLiteralIssue | ZodUnrecognizedKeysIssue | ZodInvalidUnionIssue | ZodInvalidUnionDiscriminatorIssue | ZodInvalidEnumValueIssue | ZodInvalidArgumentsIssue | ZodInvalidReturnTypeIssue | ZodInvalidDateIssue | ZodInvalidStringIssue | ZodTooSmallIssue | ZodTooBigIssue | ZodInvalidIntersectionTypesIssue | ZodNotMultipleOfIssue | ZodNotFiniteIssue | ZodCustomIssue;
type ZodIssue = ZodIssueOptionalMessage & {
    fatal?: boolean;
    message: string;
};
declare const quotelessJson: (obj: any) => string;
type recursiveZodFormattedError<T> = T extends [
    any,
    ...any[]
] ? {
    [K in keyof T]?: ZodFormattedError<T[K]>;
} : T extends any[] ? {
    [k: number]: ZodFormattedError<T[number]>;
} : T extends object ? {
    [K in keyof T]?: ZodFormattedError<T[K]>;
} : unknown;
type ZodFormattedError<T, U = string> = {
    _errors: U[];
} & recursiveZodFormattedError<NonNullable<T>>;
type inferFormattedError<T extends ZodType<any, any, any>, U = string> = ZodFormattedError<TypeOf<T>, U>;
declare class ZodError<T = any> extends Error {
    issues: ZodIssue[];
    get errors(): ZodIssue[];
    constructor(issues: ZodIssue[]);
    format(): ZodFormattedError<T>;
    format<U>(mapper: (issue: ZodIssue) => U): ZodFormattedError<T, U>;
    static create: (issues: ZodIssue[]) => ZodError<any>;
    toString(): string;
    get message(): string;
    get isEmpty(): boolean;
    addIssue: (sub: ZodIssue) => void;
    addIssues: (subs?: ZodIssue[]) => void;
    flatten(): typeToFlattenedError<T>;
    flatten<U>(mapper?: (issue: ZodIssue) => U): typeToFlattenedError<T, U>;
    get formErrors(): typeToFlattenedError<T, string>;
}
type stripPath<T extends object> = T extends any ? util.OmitKeys<T, "path"> : never;
type IssueData = stripPath<ZodIssueOptionalMessage> & {
    path?: (string | number)[];
    fatal?: boolean;
};
type ErrorMapCtx = {
    defaultError: string;
    data: any;
};
type ZodErrorMap = (issue: ZodIssueOptionalMessage, _ctx: ErrorMapCtx) => {
    message: string;
};

declare const errorMap: ZodErrorMap;

declare function setErrorMap(map: ZodErrorMap): void;
declare function getErrorMap(): ZodErrorMap;

declare const makeIssue: (params: {
    data: any;
    path: (string | number)[];
    errorMaps: ZodErrorMap[];
    issueData: IssueData;
}) => ZodIssue;
type ParseParams = {
    path: (string | number)[];
    errorMap: ZodErrorMap;
    async: boolean;
};
type ParsePathComponent = string | number;
type ParsePath = ParsePathComponent[];
declare const EMPTY_PATH: ParsePath;
interface ParseContext {
    readonly common: {
        readonly issues: ZodIssue[];
        readonly contextualErrorMap?: ZodErrorMap;
        readonly async: boolean;
    };
    readonly path: ParsePath;
    readonly schemaErrorMap?: ZodErrorMap;
    readonly parent: ParseContext | null;
    readonly data: any;
    readonly parsedType: ZodParsedType;
}
type ParseInput = {
    data: any;
    path: (string | number)[];
    parent: ParseContext;
};
declare function addIssueToContext(ctx: ParseContext, issueData: IssueData): void;
type ObjectPair = {
    key: SyncParseReturnType<any>;
    value: SyncParseReturnType<any>;
};
declare class ParseStatus {
    value: "aborted" | "dirty" | "valid";
    dirty(): void;
    abort(): void;
    static mergeArray(status: ParseStatus, results: SyncParseReturnType<any>[]): SyncParseReturnType;
    static mergeObjectAsync(status: ParseStatus, pairs: {
        key: ParseReturnType<any>;
        value: ParseReturnType<any>;
    }[]): Promise<SyncParseReturnType<any>>;
    static mergeObjectSync(status: ParseStatus, pairs: {
        key: SyncParseReturnType<any>;
        value: SyncParseReturnType<any>;
        alwaysSet?: boolean;
    }[]): SyncParseReturnType;
}
interface ParseResult {
    status: "aborted" | "dirty" | "valid";
    data: any;
}
type INVALID = {
    status: "aborted";
};
declare const INVALID: INVALID;
type DIRTY<T> = {
    status: "dirty";
    value: T;
};
declare const DIRTY: <T>(value: T) => DIRTY<T>;
type OK<T> = {
    status: "valid";
    value: T;
};
declare const OK: <T>(value: T) => OK<T>;
type SyncParseReturnType<T = any> = OK<T> | DIRTY<T> | INVALID;
type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;
type ParseReturnType<T> = SyncParseReturnType<T> | AsyncParseReturnType<T>;
declare const isAborted: (x: ParseReturnType<any>) => x is INVALID;
declare const isDirty: <T>(x: ParseReturnType<T>) => x is OK<T> | DIRTY<T>;
declare const isValid: <T>(x: ParseReturnType<T>) => x is OK<T> | DIRTY<T>;
declare const isAsync: <T>(x: ParseReturnType<T>) => x is AsyncParseReturnType<T>;

declare namespace enumUtil {
    type UnionToIntersectionFn<T> = (T extends unknown ? (k: () => T) => void : never) extends (k: infer Intersection) => void ? Intersection : never;
    type GetUnionLast<T> = UnionToIntersectionFn<T> extends () => infer Last ? Last : never;
    type UnionToTuple<T, Tuple extends unknown[] = [
    ]> = [
        T
    ] extends [
        never
    ] ? Tuple : UnionToTuple<Exclude<T, GetUnionLast<T>>, [
        GetUnionLast<T>,
        ...Tuple
    ]>;
    type CastToStringTuple<T> = T extends [
        string,
        ...string[]
    ] ? T : never;
    export type UnionToTupleString<T> = CastToStringTuple<UnionToTuple<T>>;
    export {  };
}

declare namespace errorUtil {
    type ErrMessage = string | {
        message?: string;
    };
    const errToObj: (message?: ErrMessage) => {
        message?: string | undefined;
    };
    const toString: (message?: ErrMessage) => string | undefined;
}

declare namespace partialUtil {
    type DeepPartial<T extends ZodTypeAny> = T extends ZodObject<ZodRawShape> ? ZodObject<{
        [k in keyof T["shape"]]: ZodOptional<DeepPartial<T["shape"][k]>>;
    }, T["_def"]["unknownKeys"], T["_def"]["catchall"]> : T extends ZodArray<infer Type, infer Card> ? ZodArray<DeepPartial<Type>, Card> : T extends ZodOptional<infer Type> ? ZodOptional<DeepPartial<Type>> : T extends ZodNullable<infer Type> ? ZodNullable<DeepPartial<Type>> : T extends ZodTuple<infer Items> ? {
        [k in keyof Items]: Items[k] extends ZodTypeAny ? DeepPartial<Items[k]> : never;
    } extends infer PI ? PI extends ZodTupleItems ? ZodTuple<PI> : never : never : T;
}

interface DefaultProps {
    env?: string;
    variables?: string;
    arg?: {
        short?: string | undefined;
        long: string;
        positional?: boolean;
    };
}

type RefinementCtx = {
    addIssue: (arg: IssueData) => void;
    path: (string | number)[];
};
type ZodRawShape = {
    [k: string]: ZodTypeAny;
};
type ZodTypeAny = ZodType<any, any, any>;
type TypeOf<T extends ZodType<any, any, any>> = T["_output"];
type input<T extends ZodType<any, any, any>> = T["_input"];
type output<T extends ZodType<any, any, any>> = T["_output"];

type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;
interface ZodTypeDef {
    errorMap?: ZodErrorMap;
    description?: string;
}
type RawCreateParams = {
    errorMap?: ZodErrorMap;
    invalid_type_error?: string;
    required_error?: string;
    description?: string;
} | undefined;
type ProcessedCreateParams = {
    errorMap?: ZodErrorMap;
    description?: string;
};
type SafeParseSuccess<Output> = {
    success: true;
    data: Output;
};
type SafeParseError<Input> = {
    success: false;
    error: ZodError<Input>;
};
type SafeParseReturnType<Input, Output> = SafeParseSuccess<Output> | SafeParseError<Input>;
declare abstract class ZodType<Output = any, Def extends ZodTypeDef = ZodTypeDef, Input = Output> {
    readonly _type: Output;
    readonly _output: Output;
    readonly _input: Input;
    readonly _def: Def;
    get description(): string | undefined;
    abstract _parse(input: ParseInput): ParseReturnType<Output>;
    _getType(input: ParseInput): string;
    _getOrReturnCtx(input: ParseInput, ctx?: ParseContext | undefined): ParseContext;
    _processInputParams(input: ParseInput): {
        status: ParseStatus;
        ctx: ParseContext;
    };
    _parseSync(input: ParseInput): SyncParseReturnType<Output>;
    _parseAsync(input: ParseInput): AsyncParseReturnType<Output>;
    parse(data?: unknown, params?: Partial<ParseParams>): Output;
    safeParse(data?: unknown, params?: Partial<ParseParams>): SafeParseReturnType<Input, Output>;
    parseAsync(data?: unknown, params?: Partial<ParseParams>): Promise<Output>;
    safeParseAsync(data?: unknown, params?: Partial<ParseParams>): Promise<SafeParseReturnType<Input, Output>>;
    spa: (data?: unknown, params?: Partial<ParseParams>) => Promise<SafeParseReturnType<Input, Output>>;
    refine<RefinedOutput extends Output>(check: (arg: Output) => arg is RefinedOutput, message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)): ZodEffects<this, RefinedOutput, Input>;
    refine(check: (arg: Output) => unknown | Promise<unknown>, message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)): ZodEffects<this, Output, Input>;
    refinement<RefinedOutput extends Output>(check: (arg: Output) => arg is RefinedOutput, refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)): ZodEffects<this, RefinedOutput, Input>;
    refinement(check: (arg: Output) => boolean, refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)): ZodEffects<this, Output, Input>;
    _refinement(refinement: RefinementEffect<Output>["refinement"]): ZodEffects<this, Output, Input>;
    superRefine<RefinedOutput extends Output>(refinement: (arg: Output, ctx: RefinementCtx) => arg is RefinedOutput): ZodEffects<this, RefinedOutput, Input>;
    superRefine(refinement: (arg: Output, ctx: RefinementCtx) => void): ZodEffects<this, Output, Input>;
    superRefine(refinement: (arg: Output, ctx: RefinementCtx) => Promise<void>): ZodEffects<this, Output, Input>;
    constructor(def: Def);
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
    nullish(): ZodOptional<ZodNullable<this>>;
    array(): ZodArray<this>;
    promise(): ZodPromise<this>;
    or<T extends ZodTypeAny>(option: T): ZodUnion<[
        this,
        T
    ]>;
    and<T extends ZodTypeAny>(incoming: T): ZodIntersection<this, T>;
    transform<NewOut>(transform: (arg: Output, ctx: RefinementCtx) => NewOut | Promise<NewOut>): ZodEffects<this, NewOut>;
    default(def?: util.noUndefined<Input>, options?: DefaultProps): ZodDefault<this>;
    default(def?: () => util.noUndefined<Input>, options?: DefaultProps): ZodDefault<this>;
    brand<B extends string | number | symbol>(brand?: B): ZodBranded<this, B>;
    catch(def: Output): ZodCatch<this>;
    catch(def: (ctx: {
        error: ZodError;
        input: Input;
    }) => Output): ZodCatch<this>;
    describe(description: string): this;
    pipe<T extends ZodTypeAny>(target: T): ZodPipeline<this, T>;
    readonly(): ZodReadonly<this>;
    isOptional(): boolean;
    isNullable(): boolean;
}
type IpVersion = "v4" | "v6";
type ZodStringCheck = {
    kind: "min";
    value: number;
    message?: string;
} | {
    kind: "max";
    value: number;
    message?: string;
} | {
    kind: "length";
    value: number;
    message?: string;
} | {
    kind: "email";
    message?: string;
} | {
    kind: "url";
    message?: string;
} | {
    kind: "emoji";
    message?: string;
} | {
    kind: "uuid";
    message?: string;
} | {
    kind: "cuid";
    message?: string;
} | {
    kind: "includes";
    value: string;
    position?: number;
    message?: string;
} | {
    kind: "cuid2";
    message?: string;
} | {
    kind: "ulid";
    message?: string;
} | {
    kind: "startsWith";
    value: string;
    message?: string;
} | {
    kind: "endsWith";
    value: string;
    message?: string;
} | {
    kind: "regex";
    regex: RegExp;
    message?: string;
} | {
    kind: "trim";
    message?: string;
} | {
    kind: "toLowerCase";
    message?: string;
} | {
    kind: "toUpperCase";
    message?: string;
} | {
    kind: "datetime";
    offset: boolean;
    precision: number | null;
    message?: string;
} | {
    kind: "ip";
    version?: IpVersion;
    message?: string;
};
interface ZodStringDef extends ZodTypeDef {
    checks: ZodStringCheck[];
    typeName: ZodFirstPartyTypeKind.ZodString;
    coerce: boolean;
}
declare class ZodString extends ZodType<string, ZodStringDef> {
    _parse(input: ParseInput): ParseReturnType<string>;
    protected _regex: (regex: RegExp, validation: StringValidation, message?: errorUtil.ErrMessage) => ZodEffects<this, string, string>;
    _addCheck(check: ZodStringCheck): ZodString;
    email(message?: errorUtil.ErrMessage): ZodString;
    url(message?: errorUtil.ErrMessage): ZodString;
    emoji(message?: errorUtil.ErrMessage): ZodString;
    uuid(message?: errorUtil.ErrMessage): ZodString;
    cuid(message?: errorUtil.ErrMessage): ZodString;
    cuid2(message?: errorUtil.ErrMessage): ZodString;
    ulid(message?: errorUtil.ErrMessage): ZodString;
    ip(options?: string | {
        version?: "v4" | "v6";
        message?: string;
    }): ZodString;
    datetime(options?: string | {
        message?: string | undefined;
        precision?: number | null;
        offset?: boolean;
    }): ZodString;
    regex(regex: RegExp, message?: errorUtil.ErrMessage): ZodString;
    includes(value: string, options?: {
        message?: string;
        position?: number;
    }): ZodString;
    startsWith(value: string, message?: errorUtil.ErrMessage): ZodString;
    endsWith(value: string, message?: errorUtil.ErrMessage): ZodString;
    min(minLength: number, message?: errorUtil.ErrMessage): ZodString;
    max(maxLength: number, message?: errorUtil.ErrMessage): ZodString;
    length(len: number, message?: errorUtil.ErrMessage): ZodString;
    nonempty: (message?: errorUtil.ErrMessage) => ZodString;
    trim: () => ZodString;
    toLowerCase: () => ZodString;
    toUpperCase: () => ZodString;
    get isDatetime(): boolean;
    get isEmail(): boolean;
    get isURL(): boolean;
    get isEmoji(): boolean;
    get isUUID(): boolean;
    get isCUID(): boolean;
    get isCUID2(): boolean;
    get isULID(): boolean;
    get isIP(): boolean;
    get minLength(): number | null;
    get maxLength(): number | null;
    static create: (params?: RawCreateParams & {
        coerce?: true;
    }) => ZodString;
}
type ZodNumberCheck = {
    kind: "min";
    value: number;
    inclusive: boolean;
    message?: string;
} | {
    kind: "max";
    value: number;
    inclusive: boolean;
    message?: string;
} | {
    kind: "int";
    message?: string;
} | {
    kind: "multipleOf";
    value: number;
    message?: string;
} | {
    kind: "finite";
    message?: string;
};
interface ZodNumberDef extends ZodTypeDef {
    checks: ZodNumberCheck[];
    typeName: ZodFirstPartyTypeKind.ZodNumber;
    coerce: boolean;
}
declare class ZodNumber extends ZodType<number, ZodNumberDef> {
    _parse(input: ParseInput): ParseReturnType<number>;
    static create: (params?: RawCreateParams & {
        coerce?: boolean;
    }) => ZodNumber;
    gte(value: number, message?: errorUtil.ErrMessage): ZodNumber;
    min: (value: number, message?: errorUtil.ErrMessage) => ZodNumber;
    gt(value: number, message?: errorUtil.ErrMessage): ZodNumber;
    lte(value: number, message?: errorUtil.ErrMessage): ZodNumber;
    max: (value: number, message?: errorUtil.ErrMessage) => ZodNumber;
    lt(value: number, message?: errorUtil.ErrMessage): ZodNumber;
    protected setLimit(kind: "min" | "max", value: number, inclusive: boolean, message?: string): ZodNumber;
    _addCheck(check: ZodNumberCheck): ZodNumber;
    int(message?: errorUtil.ErrMessage): ZodNumber;
    positive(message?: errorUtil.ErrMessage): ZodNumber;
    negative(message?: errorUtil.ErrMessage): ZodNumber;
    nonpositive(message?: errorUtil.ErrMessage): ZodNumber;
    nonnegative(message?: errorUtil.ErrMessage): ZodNumber;
    multipleOf(value: number, message?: errorUtil.ErrMessage): ZodNumber;
    step: (value: number, message?: errorUtil.ErrMessage) => ZodNumber;
    finite(message?: errorUtil.ErrMessage): ZodNumber;
    safe(message?: errorUtil.ErrMessage): ZodNumber;
    get minValue(): number | null;
    get maxValue(): number | null;
    get isInt(): boolean;
    get isFinite(): boolean;
}
type ZodBigIntCheck = {
    kind: "min";
    value: bigint;
    inclusive: boolean;
    message?: string;
} | {
    kind: "max";
    value: bigint;
    inclusive: boolean;
    message?: string;
} | {
    kind: "multipleOf";
    value: bigint;
    message?: string;
};
interface ZodBigIntDef extends ZodTypeDef {
    checks: ZodBigIntCheck[];
    typeName: ZodFirstPartyTypeKind.ZodBigInt;
    coerce: boolean;
}
declare class ZodBigInt extends ZodType<bigint, ZodBigIntDef> {
    _parse(input: ParseInput): ParseReturnType<bigint>;
    static create: (params?: RawCreateParams & {
        coerce?: boolean;
    }) => ZodBigInt;
    gte(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
    min: (value: bigint, message?: errorUtil.ErrMessage) => ZodBigInt;
    gt(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
    lte(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
    max: (value: bigint, message?: errorUtil.ErrMessage) => ZodBigInt;
    lt(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
    protected setLimit(kind: "min" | "max", value: bigint, inclusive: boolean, message?: string): ZodBigInt;
    _addCheck(check: ZodBigIntCheck): ZodBigInt;
    positive(message?: errorUtil.ErrMessage): ZodBigInt;
    negative(message?: errorUtil.ErrMessage): ZodBigInt;
    nonpositive(message?: errorUtil.ErrMessage): ZodBigInt;
    nonnegative(message?: errorUtil.ErrMessage): ZodBigInt;
    multipleOf(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
    get minValue(): bigint | null;
    get maxValue(): bigint | null;
}
interface ZodBooleanDef extends ZodTypeDef {
    typeName: ZodFirstPartyTypeKind.ZodBoolean;
    coerce: boolean;
}
declare class ZodBoolean extends ZodType<boolean, ZodBooleanDef> {
    _parse(input: ParseInput): ParseReturnType<boolean>;
    static create: (params?: RawCreateParams & {
        coerce?: boolean;
    }) => ZodBoolean;
}
type ZodDateCheck = {
    kind: "min";
    value: number;
    message?: string;
} | {
    kind: "max";
    value: number;
    message?: string;
};
interface ZodDateDef extends ZodTypeDef {
    checks: ZodDateCheck[];
    coerce: boolean;
    typeName: ZodFirstPartyTypeKind.ZodDate;
}
declare class ZodDate extends ZodType<Date, ZodDateDef> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    _addCheck(check: ZodDateCheck): ZodDate;
    min(minDate: Date, message?: errorUtil.ErrMessage): ZodDate;
    max(maxDate: Date, message?: errorUtil.ErrMessage): ZodDate;
    get minDate(): Date | null;
    get maxDate(): Date | null;
    static create: (params?: RawCreateParams & {
        coerce?: boolean;
    }) => ZodDate;
}
interface ZodSymbolDef extends ZodTypeDef {
    typeName: ZodFirstPartyTypeKind.ZodSymbol;
}
declare class ZodSymbol extends ZodType<symbol, ZodSymbolDef, symbol> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: (params?: RawCreateParams) => ZodSymbol;
}
interface ZodUndefinedDef extends ZodTypeDef {
    typeName: ZodFirstPartyTypeKind.ZodUndefined;
}
declare class ZodUndefined extends ZodType<undefined, ZodUndefinedDef> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    params?: RawCreateParams;
    static create: (params?: RawCreateParams) => ZodUndefined;
}
interface ZodNullDef extends ZodTypeDef {
    typeName: ZodFirstPartyTypeKind.ZodNull;
}
declare class ZodNull extends ZodType<null, ZodNullDef> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: (params?: RawCreateParams) => ZodNull;
}
interface ZodAnyDef extends ZodTypeDef {
    typeName: ZodFirstPartyTypeKind.ZodAny;
}
declare class ZodAny extends ZodType<any, ZodAnyDef> {
    _any: true;
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: (params?: RawCreateParams) => ZodAny;
}
interface ZodUnknownDef extends ZodTypeDef {
    typeName: ZodFirstPartyTypeKind.ZodUnknown;
}
declare class ZodUnknown extends ZodType<unknown, ZodUnknownDef> {
    _unknown: true;
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: (params?: RawCreateParams) => ZodUnknown;
}
interface ZodNeverDef extends ZodTypeDef {
    typeName: ZodFirstPartyTypeKind.ZodNever;
}
declare class ZodNever extends ZodType<never, ZodNeverDef> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: (params?: RawCreateParams) => ZodNever;
}
interface ZodVoidDef extends ZodTypeDef {
    typeName: ZodFirstPartyTypeKind.ZodVoid;
}
declare class ZodVoid extends ZodType<void, ZodVoidDef> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: (params?: RawCreateParams) => ZodVoid;
}
interface ZodArrayDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    type: T;
    typeName: ZodFirstPartyTypeKind.ZodArray;
    exactLength: {
        value: number;
        message?: string;
    } | null;
    minLength: {
        value: number;
        message?: string;
    } | null;
    maxLength: {
        value: number;
        message?: string;
    } | null;
}
type ArrayCardinality = "many" | "atleastone";
type arrayOutputType<T extends ZodTypeAny, Cardinality extends ArrayCardinality = "many"> = Cardinality extends "atleastone" ? [
    T["_output"],
    ...T["_output"][]
] : T["_output"][];
declare class ZodArray<T extends ZodTypeAny, Cardinality extends ArrayCardinality = "many"> extends ZodType<arrayOutputType<T, Cardinality>, ZodArrayDef<T>, Cardinality extends "atleastone" ? [
    T["_input"],
    ...T["_input"][]
] : T["_input"][]> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    get element(): T;
    min(minLength: number, message?: errorUtil.ErrMessage): this;
    max(maxLength: number, message?: errorUtil.ErrMessage): this;
    length(len: number, message?: errorUtil.ErrMessage): this;
    nonempty(message?: errorUtil.ErrMessage): ZodArray<T, "atleastone">;
    static create: <T_1 extends ZodTypeAny>(schema: T_1, params?: RawCreateParams) => ZodArray<T_1, "many">;
}
type ZodNonEmptyArray<T extends ZodTypeAny> = ZodArray<T, "atleastone">;
type UnknownKeysParam = "passthrough" | "strict" | "strip";
interface ZodObjectDef<T extends ZodRawShape = ZodRawShape, UnknownKeys extends UnknownKeysParam = UnknownKeysParam, Catchall extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    typeName: ZodFirstPartyTypeKind.ZodObject;
    shape: () => T;
    catchall: Catchall;
    unknownKeys: UnknownKeys;
}
type mergeTypes<A, B> = {
    [k in keyof A | keyof B]: k extends keyof B ? B[k] : k extends keyof A ? A[k] : never;
};
type objectOutputType<Shape extends ZodRawShape, Catchall extends ZodTypeAny, UnknownKeys extends UnknownKeysParam = UnknownKeysParam> = objectUtil.flatten<objectUtil.addQuestionMarks<baseObjectOutputType<Shape>>> & CatchallOutput<Catchall> & PassthroughType<UnknownKeys>;
type baseObjectOutputType<Shape extends ZodRawShape> = {
    [k in keyof Shape]: Shape[k]["_output"];
};
type objectInputType<Shape extends ZodRawShape, Catchall extends ZodTypeAny, UnknownKeys extends UnknownKeysParam = UnknownKeysParam> = objectUtil.flatten<baseObjectInputType<Shape>> & CatchallInput<Catchall> & PassthroughType<UnknownKeys>;
type baseObjectInputType<Shape extends ZodRawShape> = objectUtil.addQuestionMarks<{
    [k in keyof Shape]: Shape[k]["_input"];
}>;
type CatchallOutput<T extends ZodTypeAny> = ZodTypeAny extends T ? unknown : {
    [k: string]: T["_output"];
};
type CatchallInput<T extends ZodTypeAny> = ZodTypeAny extends T ? unknown : {
    [k: string]: T["_input"];
};
type PassthroughType<T extends UnknownKeysParam> = T extends "passthrough" ? {
    [k: string]: unknown;
} : unknown;
type deoptional<T extends ZodTypeAny> = T extends ZodOptional<infer U> ? deoptional<U> : T extends ZodNullable<infer U> ? ZodNullable<deoptional<U>> : T;
type SomeZodObject = ZodObject<ZodRawShape, UnknownKeysParam, ZodTypeAny>;
type noUnrecognized<Obj extends object, Shape extends object> = {
    [k in keyof Obj]: k extends keyof Shape ? Obj[k] : never;
};
declare class ZodObject<T extends ZodRawShape, UnknownKeys extends UnknownKeysParam = UnknownKeysParam, Catchall extends ZodTypeAny = ZodTypeAny, Output = objectOutputType<T, Catchall, UnknownKeys>, Input = objectInputType<T, Catchall, UnknownKeys>> extends ZodType<Output, ZodObjectDef<T, UnknownKeys, Catchall>, Input> {
    private _cached;
    _getCached(): {
        shape: T;
        keys: string[];
    };
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    get shape(): T;
    strict(message?: errorUtil.ErrMessage): ZodObject<T, "strict", Catchall>;
    strip(): ZodObject<T, "strip", Catchall>;
    passthrough(): ZodObject<T, "passthrough", Catchall>;
    nonstrict: () => ZodObject<T, "passthrough", Catchall>;
    extend<Augmentation extends ZodRawShape>(augmentation: Augmentation): ZodObject<objectUtil.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
    augment: <Augmentation extends ZodRawShape>(augmentation: Augmentation) => ZodObject<Omit<T, keyof Augmentation> & Augmentation extends infer T_1 ? { [k in keyof T_1]: (Omit<T, keyof Augmentation> & Augmentation)[k]; } : never, UnknownKeys, Catchall, objectOutputType<Omit<T, keyof Augmentation> & Augmentation extends infer T_1 ? { [k in keyof T_1]: (Omit<T, keyof Augmentation> & Augmentation)[k]; } : never, Catchall, UnknownKeys>, objectInputType<Omit<T, keyof Augmentation> & Augmentation extends infer T_1 ? { [k in keyof T_1]: (Omit<T, keyof Augmentation> & Augmentation)[k]; } : never, Catchall, UnknownKeys>>;
    merge<Incoming extends AnyZodObject, Augmentation extends Incoming["shape"]>(merging: Incoming): ZodObject<objectUtil.extendShape<T, Augmentation>, Incoming["_def"]["unknownKeys"], Incoming["_def"]["catchall"]>;
    setKey<Key extends string, Schema extends ZodTypeAny>(key: Key, schema: Schema): ZodObject<T & {
        [k in Key]: Schema;
    }, UnknownKeys, Catchall>;
    catchall<Index extends ZodTypeAny>(index: Index): ZodObject<T, UnknownKeys, Index>;
    pick<Mask extends {
        [k in keyof T]?: true;
    }>(mask: Mask): ZodObject<Pick<T, Extract<keyof T, keyof Mask>>, UnknownKeys, Catchall>;
    omit<Mask extends {
        [k in keyof T]?: true;
    }>(mask: Mask): ZodObject<Omit<T, keyof Mask>, UnknownKeys, Catchall>;
    deepPartial(): partialUtil.DeepPartial<this>;
    partial(): ZodObject<{
        [k in keyof T]: ZodOptional<T[k]>;
    }, UnknownKeys, Catchall>;
    partial<Mask extends {
        [k in keyof T]?: true;
    }>(mask: Mask): ZodObject<objectUtil.noNever<{
        [k in keyof T]: k extends keyof Mask ? ZodOptional<T[k]> : T[k];
    }>, UnknownKeys, Catchall>;
    required(): ZodObject<{
        [k in keyof T]: deoptional<T[k]>;
    }, UnknownKeys, Catchall>;
    required<Mask extends {
        [k in keyof T]?: true;
    }>(mask: Mask): ZodObject<objectUtil.noNever<{
        [k in keyof T]: k extends keyof Mask ? deoptional<T[k]> : T[k];
    }>, UnknownKeys, Catchall>;
    keyof(): ZodEnum<enumUtil.UnionToTupleString<keyof T>>;
    static create: <T_1 extends ZodRawShape>(shape: T_1, params?: RawCreateParams) => ZodObject<T_1, "strip", ZodTypeAny, objectUtil.addQuestionMarks<baseObjectOutputType<T_1>, { [k_1 in keyof baseObjectOutputType<T_1>]: undefined extends baseObjectOutputType<T_1>[k_1] ? never : k_1; }[keyof T_1]> extends infer T_2 ? { [k in keyof T_2]: objectUtil.addQuestionMarks<baseObjectOutputType<T_1>, { [k_1 in keyof baseObjectOutputType<T_1>]: undefined extends baseObjectOutputType<T_1>[k_1] ? never : k_1; }[keyof T_1]>[k]; } : never, baseObjectInputType<T_1> extends infer T_3 ? { [k_2 in keyof T_3]: baseObjectInputType<T_1>[k_2]; } : never>;
    static strictCreate: <T_1 extends ZodRawShape>(shape: T_1, params?: RawCreateParams) => ZodObject<T_1, "strict", ZodTypeAny, objectUtil.addQuestionMarks<baseObjectOutputType<T_1>, { [k_1 in keyof baseObjectOutputType<T_1>]: undefined extends baseObjectOutputType<T_1>[k_1] ? never : k_1; }[keyof T_1]> extends infer T_2 ? { [k in keyof T_2]: objectUtil.addQuestionMarks<baseObjectOutputType<T_1>, { [k_1 in keyof baseObjectOutputType<T_1>]: undefined extends baseObjectOutputType<T_1>[k_1] ? never : k_1; }[keyof T_1]>[k]; } : never, baseObjectInputType<T_1> extends infer T_3 ? { [k_2 in keyof T_3]: baseObjectInputType<T_1>[k_2]; } : never>;
    static lazycreate: <T_1 extends ZodRawShape>(shape: () => T_1, params?: RawCreateParams) => ZodObject<T_1, "strip", ZodTypeAny, objectUtil.addQuestionMarks<baseObjectOutputType<T_1>, { [k_1 in keyof baseObjectOutputType<T_1>]: undefined extends baseObjectOutputType<T_1>[k_1] ? never : k_1; }[keyof T_1]> extends infer T_2 ? { [k in keyof T_2]: objectUtil.addQuestionMarks<baseObjectOutputType<T_1>, { [k_1 in keyof baseObjectOutputType<T_1>]: undefined extends baseObjectOutputType<T_1>[k_1] ? never : k_1; }[keyof T_1]>[k]; } : never, baseObjectInputType<T_1> extends infer T_3 ? { [k_2 in keyof T_3]: baseObjectInputType<T_1>[k_2]; } : never>;
}
type AnyZodObject = ZodObject<any, any, any>;
type ZodUnionOptions = Readonly<[
    ZodTypeAny,
    ...ZodTypeAny[]
]>;
interface ZodUnionDef<T extends ZodUnionOptions = Readonly<[
    ZodTypeAny,
    ZodTypeAny,
    ...ZodTypeAny[]
]>> extends ZodTypeDef {
    options: T;
    typeName: ZodFirstPartyTypeKind.ZodUnion;
}
declare class ZodUnion<T extends ZodUnionOptions> extends ZodType<T[number]["_output"], ZodUnionDef<T>, T[number]["_input"]> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    get options(): T;
    static create: <T_1 extends readonly [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(types: T_1, params?: RawCreateParams) => ZodUnion<T_1>;
}
type ZodDiscriminatedUnionOption<Discriminator extends string> = ZodObject<{
    [key in Discriminator]: ZodTypeAny;
} & ZodRawShape, UnknownKeysParam, ZodTypeAny>;
interface ZodDiscriminatedUnionDef<Discriminator extends string, Options extends ZodDiscriminatedUnionOption<string>[] = ZodDiscriminatedUnionOption<string>[]> extends ZodTypeDef {
    discriminator: Discriminator;
    options: Options;
    optionsMap: Map<Primitive, ZodDiscriminatedUnionOption<any>>;
    typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion;
}
declare class ZodDiscriminatedUnion<Discriminator extends string, Options extends ZodDiscriminatedUnionOption<Discriminator>[]> extends ZodType<output<Options[number]>, ZodDiscriminatedUnionDef<Discriminator, Options>, input<Options[number]>> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    get discriminator(): Discriminator;
    get options(): Options;
    get optionsMap(): Map<Primitive, ZodDiscriminatedUnionOption<any>>;
    static create<Discriminator extends string, Types extends [
        ZodDiscriminatedUnionOption<Discriminator>,
        ...ZodDiscriminatedUnionOption<Discriminator>[]
    ]>(discriminator: Discriminator, options: Types, params?: RawCreateParams): ZodDiscriminatedUnion<Discriminator, Types>;
}
interface ZodIntersectionDef<T extends ZodTypeAny = ZodTypeAny, U extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    left: T;
    right: U;
    typeName: ZodFirstPartyTypeKind.ZodIntersection;
}
declare class ZodIntersection<T extends ZodTypeAny, U extends ZodTypeAny> extends ZodType<T["_output"] & U["_output"], ZodIntersectionDef<T, U>, T["_input"] & U["_input"]> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: <T_1 extends ZodTypeAny, U_1 extends ZodTypeAny>(left: T_1, right: U_1, params?: RawCreateParams) => ZodIntersection<T_1, U_1>;
}
type ZodTupleItems = [
    ZodTypeAny,
    ...ZodTypeAny[]
];
type AssertArray<T> = T extends any[] ? T : never;
type OutputTypeOfTuple<T extends ZodTupleItems | [
]> = AssertArray<{
    [k in keyof T]: T[k] extends ZodType<any, any> ? T[k]["_output"] : never;
}>;
type OutputTypeOfTupleWithRest<T extends ZodTupleItems | [
], Rest extends ZodTypeAny | null = null> = Rest extends ZodTypeAny ? [
    ...OutputTypeOfTuple<T>,
    ...Rest["_output"][]
] : OutputTypeOfTuple<T>;
type InputTypeOfTuple<T extends ZodTupleItems | [
]> = AssertArray<{
    [k in keyof T]: T[k] extends ZodType<any, any> ? T[k]["_input"] : never;
}>;
type InputTypeOfTupleWithRest<T extends ZodTupleItems | [
], Rest extends ZodTypeAny | null = null> = Rest extends ZodTypeAny ? [
    ...InputTypeOfTuple<T>,
    ...Rest["_input"][]
] : InputTypeOfTuple<T>;
interface ZodTupleDef<T extends ZodTupleItems | [
] = ZodTupleItems, Rest extends ZodTypeAny | null = null> extends ZodTypeDef {
    items: T;
    rest: Rest;
    typeName: ZodFirstPartyTypeKind.ZodTuple;
}
type AnyZodTuple = ZodTuple<[
    ZodTypeAny,
    ...ZodTypeAny[]
] | [
], ZodTypeAny | null>;
declare class ZodTuple<T extends [
    ZodTypeAny,
    ...ZodTypeAny[]
] | [
] = [
    ZodTypeAny,
    ...ZodTypeAny[]
], Rest extends ZodTypeAny | null = null> extends ZodType<OutputTypeOfTupleWithRest<T, Rest>, ZodTupleDef<T, Rest>, InputTypeOfTupleWithRest<T, Rest>> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    get items(): T;
    rest<Rest extends ZodTypeAny>(rest: Rest): ZodTuple<T, Rest>;
    static create: <T_1 extends [] | [ZodTypeAny, ...ZodTypeAny[]]>(schemas: T_1, params?: RawCreateParams) => ZodTuple<T_1, null>;
}
interface ZodRecordDef<Key extends KeySchema = ZodString, Value extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    valueType: Value;
    keyType: Key;
    typeName: ZodFirstPartyTypeKind.ZodRecord;
}
type KeySchema = ZodType<string | number | symbol, any, any>;
type RecordType<K extends string | number | symbol, V> = [
    string
] extends [
    K
] ? Record<K, V> : [
    number
] extends [
    K
] ? Record<K, V> : [
    symbol
] extends [
    K
] ? Record<K, V> : [
    BRAND<string | number | symbol>
] extends [
    K
] ? Record<K, V> : Partial<Record<K, V>>;
declare class ZodRecord<Key extends KeySchema = ZodString, Value extends ZodTypeAny = ZodTypeAny> extends ZodType<RecordType<Key["_output"], Value["_output"]>, ZodRecordDef<Key, Value>, RecordType<Key["_input"], Value["_input"]>> {
    get keySchema(): Key;
    get valueSchema(): Value;
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    get element(): Value;
    static create<Value extends ZodTypeAny>(valueType: Value, params?: RawCreateParams): ZodRecord<ZodString, Value>;
    static create<Keys extends KeySchema, Value extends ZodTypeAny>(keySchema: Keys, valueType: Value, params?: RawCreateParams): ZodRecord<Keys, Value>;
}
interface ZodMapDef<Key extends ZodTypeAny = ZodTypeAny, Value extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    valueType: Value;
    keyType: Key;
    typeName: ZodFirstPartyTypeKind.ZodMap;
}
declare class ZodMap<Key extends ZodTypeAny = ZodTypeAny, Value extends ZodTypeAny = ZodTypeAny> extends ZodType<Map<Key["_output"], Value["_output"]>, ZodMapDef<Key, Value>, Map<Key["_input"], Value["_input"]>> {
    get keySchema(): Key;
    get valueSchema(): Value;
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: <Key_1 extends ZodTypeAny = ZodTypeAny, Value_1 extends ZodTypeAny = ZodTypeAny>(keyType: Key_1, valueType: Value_1, params?: RawCreateParams) => ZodMap<Key_1, Value_1>;
}
interface ZodSetDef<Value extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    valueType: Value;
    typeName: ZodFirstPartyTypeKind.ZodSet;
    minSize: {
        value: number;
        message?: string;
    } | null;
    maxSize: {
        value: number;
        message?: string;
    } | null;
}
declare class ZodSet<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<Set<Value["_output"]>, ZodSetDef<Value>, Set<Value["_input"]>> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    min(minSize: number, message?: errorUtil.ErrMessage): this;
    max(maxSize: number, message?: errorUtil.ErrMessage): this;
    size(size: number, message?: errorUtil.ErrMessage): this;
    nonempty(message?: errorUtil.ErrMessage): ZodSet<Value>;
    static create: <Value_1 extends ZodTypeAny = ZodTypeAny>(valueType: Value_1, params?: RawCreateParams) => ZodSet<Value_1>;
}
interface ZodFunctionDef<Args extends ZodTuple<any, any> = ZodTuple<any, any>, Returns extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    args: Args;
    returns: Returns;
    typeName: ZodFirstPartyTypeKind.ZodFunction;
}
type OuterTypeOfFunction<Args extends ZodTuple<any, any>, Returns extends ZodTypeAny> = Args["_input"] extends Array<any> ? (...args: Args["_input"]) => Returns["_output"] : never;
type InnerTypeOfFunction<Args extends ZodTuple<any, any>, Returns extends ZodTypeAny> = Args["_output"] extends Array<any> ? (...args: Args["_output"]) => Returns["_input"] : never;
declare class ZodFunction<Args extends ZodTuple<any, any>, Returns extends ZodTypeAny> extends ZodType<OuterTypeOfFunction<Args, Returns>, ZodFunctionDef<Args, Returns>, InnerTypeOfFunction<Args, Returns>> {
    _parse(input: ParseInput): ParseReturnType<any>;
    parameters(): Args;
    returnType(): Returns;
    args<Items extends Parameters<(typeof ZodTuple)["create"]>[0]>(...items: Items): ZodFunction<ZodTuple<Items, ZodUnknown>, Returns>;
    returns<NewReturnType extends ZodType<any, any>>(returnType: NewReturnType): ZodFunction<Args, NewReturnType>;
    implement<F extends InnerTypeOfFunction<Args, Returns>>(func: F): ReturnType<F> extends Returns["_output"] ? (...args: Args["_input"]) => ReturnType<F> : OuterTypeOfFunction<Args, Returns>;
    strictImplement(func: InnerTypeOfFunction<Args, Returns>): InnerTypeOfFunction<Args, Returns>;
    validate: <F extends InnerTypeOfFunction<Args, Returns>>(func: F) => ReturnType<F> extends Returns["_output"] ? (...args: Args["_input"]) => ReturnType<F> : OuterTypeOfFunction<Args, Returns>;
    static create(): ZodFunction<ZodTuple<[
    ], ZodUnknown>, ZodUnknown>;
    static create<T extends AnyZodTuple = ZodTuple<[
    ], ZodUnknown>>(args: T): ZodFunction<T, ZodUnknown>;
    static create<T extends AnyZodTuple, U extends ZodTypeAny>(args: T, returns: U): ZodFunction<T, U>;
    static create<T extends AnyZodTuple = ZodTuple<[
    ], ZodUnknown>, U extends ZodTypeAny = ZodUnknown>(args: T, returns: U, params?: RawCreateParams): ZodFunction<T, U>;
}
interface ZodLazyDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    getter: () => T;
    typeName: ZodFirstPartyTypeKind.ZodLazy;
}
declare class ZodLazy<T extends ZodTypeAny> extends ZodType<output<T>, ZodLazyDef<T>, input<T>> {
    get schema(): T;
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: <T_1 extends ZodTypeAny>(getter: () => T_1, params?: RawCreateParams) => ZodLazy<T_1>;
}
interface ZodLiteralDef<T = any> extends ZodTypeDef {
    value: T;
    typeName: ZodFirstPartyTypeKind.ZodLiteral;
}
declare class ZodLiteral<T> extends ZodType<T, ZodLiteralDef<T>> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    get value(): T;
    static create: <T_1 extends Primitive>(value: T_1, params?: RawCreateParams) => ZodLiteral<T_1>;
}
type ArrayKeys = keyof any[];
type Indices<T> = Exclude<keyof T, ArrayKeys>;
type EnumValues = [
    string,
    ...string[]
];
type Values<T extends EnumValues> = {
    [k in T[number]]: k;
};
interface ZodEnumDef<T extends EnumValues = EnumValues> extends ZodTypeDef {
    values: T;
    typeName: ZodFirstPartyTypeKind.ZodEnum;
}
type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
type FilterEnum<Values, ToExclude> = Values extends [
] ? [
] : Values extends [
    infer Head,
    ...infer Rest
] ? Head extends ToExclude ? FilterEnum<Rest, ToExclude> : [
    Head,
    ...FilterEnum<Rest, ToExclude>
] : never;
type typecast<A, T> = A extends T ? A : never;
declare function createZodEnum<U extends string, T extends Readonly<[
    U,
    ...U[]
]>>(values: T, params?: RawCreateParams): ZodEnum<Writeable<T>>;
declare function createZodEnum<U extends string, T extends [
    U,
    ...U[]
]>(values: T, params?: RawCreateParams): ZodEnum<T>;
declare class ZodEnum<T extends [
    string,
    ...string[]
]> extends ZodType<T[number], ZodEnumDef<T>> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    get options(): T;
    get enum(): Values<T>;
    get Values(): Values<T>;
    get Enum(): Values<T>;
    extract<ToExtract extends readonly [
        T[number],
        ...T[number][]
    ]>(values: ToExtract): ZodEnum<Writeable<ToExtract>>;
    exclude<ToExclude extends readonly [
        T[number],
        ...T[number][]
    ]>(values: ToExclude): ZodEnum<typecast<Writeable<FilterEnum<T, ToExclude[number]>>, [
        string,
        ...string[]
    ]>>;
    static create: typeof createZodEnum;
}
interface ZodNativeEnumDef<T extends EnumLike = EnumLike> extends ZodTypeDef {
    values: T;
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum;
}
type EnumLike = {
    [k: string]: string | number;
    [nu: number]: string;
};
declare class ZodNativeEnum<T extends EnumLike> extends ZodType<T[keyof T], ZodNativeEnumDef<T>> {
    _parse(input: ParseInput): ParseReturnType<T[keyof T]>;
    get enum(): T;
    static create: <T_1 extends EnumLike>(values: T_1, params?: RawCreateParams) => ZodNativeEnum<T_1>;
}
interface ZodPromiseDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    type: T;
    typeName: ZodFirstPartyTypeKind.ZodPromise;
}
declare class ZodPromise<T extends ZodTypeAny> extends ZodType<Promise<T["_output"]>, ZodPromiseDef<T>, Promise<T["_input"]>> {
    unwrap(): T;
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: <T_1 extends ZodTypeAny>(schema: T_1, params?: RawCreateParams) => ZodPromise<T_1>;
}
type Refinement<T> = (arg: T, ctx: RefinementCtx) => any;
type SuperRefinement<T> = (arg: T, ctx: RefinementCtx) => void | Promise<void>;
type RefinementEffect<T> = {
    type: "refinement";
    refinement: (arg: T, ctx: RefinementCtx) => any;
};
type TransformEffect<T> = {
    type: "transform";
    transform: (arg: T, ctx: RefinementCtx) => any;
};
type PreprocessEffect<T> = {
    type: "preprocess";
    transform: (arg: T, ctx: RefinementCtx) => any;
};
type Effect<T> = RefinementEffect<T> | TransformEffect<T> | PreprocessEffect<T>;
interface ZodEffectsDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    schema: T;
    typeName: ZodFirstPartyTypeKind.ZodEffects;
    effect: Effect<any>;
}
declare class ZodEffects<T extends ZodTypeAny, Output = output<T>, Input = input<T>> extends ZodType<Output, ZodEffectsDef<T>, Input> {
    innerType(): T;
    sourceType(): T;
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: <I extends ZodTypeAny>(schema: I, effect: Effect<I["_output"]>, params?: RawCreateParams) => ZodEffects<I, I["_output"], input<I>>;
    static createWithPreprocess: <I extends ZodTypeAny>(preprocess: (arg: unknown, ctx: RefinementCtx) => unknown, schema: I, params?: RawCreateParams) => ZodEffects<I, I["_output"], unknown>;
}

interface ZodOptionalDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    typeName: ZodFirstPartyTypeKind.ZodOptional;
}
type ZodOptionalType<T extends ZodTypeAny> = ZodOptional<T>;
declare class ZodOptional<T extends ZodTypeAny> extends ZodType<T["_output"] | undefined, ZodOptionalDef<T>, T["_input"] | undefined> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    unwrap(): T;
    static create: <T_1 extends ZodTypeAny>(type: T_1, params?: RawCreateParams) => ZodOptional<T_1>;
}
interface ZodNullableDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    typeName: ZodFirstPartyTypeKind.ZodNullable;
}
type ZodNullableType<T extends ZodTypeAny> = ZodNullable<T>;
declare class ZodNullable<T extends ZodTypeAny> extends ZodType<T["_output"] | null, ZodNullableDef<T>, T["_input"] | null> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    unwrap(): T;
    static create: <T_1 extends ZodTypeAny>(type: T_1, params?: RawCreateParams) => ZodNullable<T_1>;
}
interface ZodDefaultDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    defaultValue: () => util.noUndefined<T["_input"]>;
    typeName: ZodFirstPartyTypeKind.ZodDefault;
}
declare class ZodDefault<T extends ZodTypeAny> extends ZodType<util.noUndefined<T["_output"]>, ZodDefaultDef<T>, T["_input"] | undefined> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    removeDefault(): T;
    static create: <T_1 extends ZodTypeAny>(type: T_1, params: {
        errorMap?: ZodErrorMap | undefined;
        invalid_type_error?: string | undefined;
        required_error?: string | undefined;
        description?: string | undefined;
    } & {
        default: T_1["_input"] | (() => util.noUndefined<T_1["_input"]>);
    }) => ZodDefault<T_1>;
}
interface ZodCatchDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    catchValue: (ctx: {
        error: ZodError;
        input: unknown;
    }) => T["_input"];
    typeName: ZodFirstPartyTypeKind.ZodCatch;
}
declare class ZodCatch<T extends ZodTypeAny> extends ZodType<T["_output"], ZodCatchDef<T>, unknown> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    removeCatch(): T;
    static create: <T_1 extends ZodTypeAny>(type: T_1, params: {
        errorMap?: ZodErrorMap | undefined;
        invalid_type_error?: string | undefined;
        required_error?: string | undefined;
        description?: string | undefined;
    } & {
        catch: T_1["_output"] | (() => T_1["_output"]);
    }) => ZodCatch<T_1>;
}
interface ZodNaNDef extends ZodTypeDef {
    typeName: ZodFirstPartyTypeKind.ZodNaN;
}
declare class ZodNaN extends ZodType<number, ZodNaNDef> {
    _parse(input: ParseInput): ParseReturnType<any>;
    static create: (params?: RawCreateParams) => ZodNaN;
}
interface ZodBrandedDef<T extends ZodTypeAny> extends ZodTypeDef {
    type: T;
    typeName: ZodFirstPartyTypeKind.ZodBranded;
}
declare const BRAND: unique symbol;
type BRAND<T extends string | number | symbol> = {
    [BRAND]: {
        [k in T]: true;
    };
};
declare class ZodBranded<T extends ZodTypeAny, B extends string | number | symbol> extends ZodType<T["_output"] & BRAND<B>, ZodBrandedDef<T>, T["_input"]> {
    _parse(input: ParseInput): ParseReturnType<any>;
    unwrap(): T;
}
interface ZodPipelineDef<A extends ZodTypeAny, B extends ZodTypeAny> extends ZodTypeDef {
    in: A;
    out: B;
    typeName: ZodFirstPartyTypeKind.ZodPipeline;
}
declare class ZodPipeline<A extends ZodTypeAny, B extends ZodTypeAny> extends ZodType<B["_output"], ZodPipelineDef<A, B>, A["_input"]> {
    _parse(input: ParseInput): ParseReturnType<any>;
    static create<A extends ZodTypeAny, B extends ZodTypeAny>(a: A, b: B): ZodPipeline<A, B>;
}
type BuiltIn = (((...args: any[]) => any) | (new (...args: any[]) => any)) | {
    readonly [Symbol.toStringTag]: string;
} | Date | Error | Generator | Promise<unknown> | RegExp;
type MakeReadonly<T> = T extends Map<infer K, infer V> ? ReadonlyMap<K, V> : T extends Set<infer V> ? ReadonlySet<V> : T extends [
    infer Head,
    ...infer Tail
] ? readonly [
    Head,
    ...Tail
] : T extends Array<infer V> ? ReadonlyArray<V> : T extends BuiltIn ? T : Readonly<T>;
interface ZodReadonlyDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    typeName: ZodFirstPartyTypeKind.ZodReadonly;
}
declare class ZodReadonly<T extends ZodTypeAny> extends ZodType<MakeReadonly<T["_output"]>, ZodReadonlyDef<T>, T["_input"]> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: <T_1 extends ZodTypeAny>(type: T_1, params?: RawCreateParams) => ZodReadonly<T_1>;
}
type CustomParams = CustomErrorParams & {
    fatal?: boolean;
};
declare const custom: <T>(check?: ((data: unknown) => any) | undefined, params?: string | CustomParams | ((input: any) => CustomParams), fatal?: boolean) => ZodType<T, ZodTypeDef, T>;

declare const late: {
    object: <T extends ZodRawShape>(shape: () => T, params?: RawCreateParams) => ZodObject<T, "strip", ZodTypeAny, objectUtil.addQuestionMarks<baseObjectOutputType<T>, { [k_1 in keyof baseObjectOutputType<T>]: undefined extends baseObjectOutputType<T>[k_1] ? never : k_1; }[keyof T]> extends infer T_1 ? { [k in keyof T_1]: objectUtil.addQuestionMarks<baseObjectOutputType<T>, { [k_1 in keyof baseObjectOutputType<T>]: undefined extends baseObjectOutputType<T>[k_1] ? never : k_1; }[keyof T]>[k]; } : never, baseObjectInputType<T> extends infer T_2 ? { [k_2 in keyof T_2]: baseObjectInputType<T>[k_2]; } : never>;
};
declare enum ZodFirstPartyTypeKind {
    ZodString = "ZodString",
    ZodNumber = "ZodNumber",
    ZodNaN = "ZodNaN",
    ZodBigInt = "ZodBigInt",
    ZodBoolean = "ZodBoolean",
    ZodDate = "ZodDate",
    ZodSymbol = "ZodSymbol",
    ZodUndefined = "ZodUndefined",
    ZodNull = "ZodNull",
    ZodAny = "ZodAny",
    ZodUnknown = "ZodUnknown",
    ZodNever = "ZodNever",
    ZodVoid = "ZodVoid",
    ZodArray = "ZodArray",
    ZodObject = "ZodObject",
    ZodUnion = "ZodUnion",
    ZodDiscriminatedUnion = "ZodDiscriminatedUnion",
    ZodIntersection = "ZodIntersection",
    ZodTuple = "ZodTuple",
    ZodRecord = "ZodRecord",
    ZodMap = "ZodMap",
    ZodSet = "ZodSet",
    ZodFunction = "ZodFunction",
    ZodLazy = "ZodLazy",
    ZodLiteral = "ZodLiteral",
    ZodEnum = "ZodEnum",
    ZodEffects = "ZodEffects",
    ZodNativeEnum = "ZodNativeEnum",
    ZodOptional = "ZodOptional",
    ZodNullable = "ZodNullable",
    ZodDefault = "ZodDefault",
    ZodCatch = "ZodCatch",
    ZodPromise = "ZodPromise",
    ZodBranded = "ZodBranded",
    ZodPipeline = "ZodPipeline",
    ZodReadonly = "ZodReadonly"
}
type ZodFirstPartySchemaTypes = ZodString | ZodNumber | ZodNaN | ZodBigInt | ZodBoolean | ZodDate | ZodUndefined | ZodNull | ZodAny | ZodUnknown | ZodNever | ZodVoid | ZodArray<any, any> | ZodObject<any, any, any> | ZodUnion<any> | ZodDiscriminatedUnion<any, any> | ZodIntersection<any, any> | ZodTuple<any, any> | ZodRecord<any, any> | ZodMap<any> | ZodSet<any> | ZodFunction<any, any> | ZodLazy<any> | ZodLiteral<any> | ZodEnum<any> | ZodEffects<any, any, any> | ZodNativeEnum<any> | ZodOptional<any> | ZodNullable<any> | ZodDefault<any> | ZodCatch<any> | ZodPromise<any> | ZodBranded<any, any> | ZodPipeline<any, any>;
declare abstract class Class {
    constructor(..._: any[]);
}
declare const instanceOfType: <T extends typeof Class>(cls: T, params?: CustomParams) => ZodType<InstanceType<T>, ZodTypeDef, InstanceType<T>>;
declare const stringType: (params?: RawCreateParams & {
    coerce?: true;
}) => ZodString;
declare const numberType: (params?: RawCreateParams & {
    coerce?: boolean;
}) => ZodNumber;
declare const nanType: (params?: RawCreateParams) => ZodNaN;
declare const bigIntType: (params?: RawCreateParams & {
    coerce?: boolean;
}) => ZodBigInt;
declare const booleanType: (params?: RawCreateParams & {
    coerce?: boolean;
}) => ZodBoolean;
declare const dateType: (params?: RawCreateParams & {
    coerce?: boolean;
}) => ZodDate;
declare const symbolType: (params?: RawCreateParams) => ZodSymbol;
declare const undefinedType: (params?: RawCreateParams) => ZodUndefined;
declare const nullType: (params?: RawCreateParams) => ZodNull;
declare const anyType: (params?: RawCreateParams) => ZodAny;
declare const unknownType: (params?: RawCreateParams) => ZodUnknown;
declare const neverType: (params?: RawCreateParams) => ZodNever;
declare const voidType: (params?: RawCreateParams) => ZodVoid;
declare const arrayType: <T extends ZodTypeAny>(schema: T, params?: RawCreateParams) => ZodArray<T, "many">;
declare const objectType: <T extends ZodRawShape>(shape: T, params?: RawCreateParams) => ZodObject<T, "strip", ZodTypeAny, objectUtil.addQuestionMarks<baseObjectOutputType<T>, { [k_1 in keyof baseObjectOutputType<T>]: undefined extends baseObjectOutputType<T>[k_1] ? never : k_1; }[keyof T]> extends infer T_1 ? { [k in keyof T_1]: objectUtil.addQuestionMarks<baseObjectOutputType<T>, { [k_1 in keyof baseObjectOutputType<T>]: undefined extends baseObjectOutputType<T>[k_1] ? never : k_1; }[keyof T]>[k]; } : never, baseObjectInputType<T> extends infer T_2 ? { [k_2 in keyof T_2]: baseObjectInputType<T>[k_2]; } : never>;
declare const strictObjectType: <T extends ZodRawShape>(shape: T, params?: RawCreateParams) => ZodObject<T, "strict", ZodTypeAny, objectUtil.addQuestionMarks<baseObjectOutputType<T>, { [k_1 in keyof baseObjectOutputType<T>]: undefined extends baseObjectOutputType<T>[k_1] ? never : k_1; }[keyof T]> extends infer T_1 ? { [k in keyof T_1]: objectUtil.addQuestionMarks<baseObjectOutputType<T>, { [k_1 in keyof baseObjectOutputType<T>]: undefined extends baseObjectOutputType<T>[k_1] ? never : k_1; }[keyof T]>[k]; } : never, baseObjectInputType<T> extends infer T_2 ? { [k_2 in keyof T_2]: baseObjectInputType<T>[k_2]; } : never>;
declare const unionType: <T extends readonly [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(types: T, params?: RawCreateParams) => ZodUnion<T>;
declare const discriminatedUnionType: typeof ZodDiscriminatedUnion.create;
declare const intersectionType: <T extends ZodTypeAny, U extends ZodTypeAny>(left: T, right: U, params?: RawCreateParams) => ZodIntersection<T, U>;
declare const tupleType: <T extends [] | [ZodTypeAny, ...ZodTypeAny[]]>(schemas: T, params?: RawCreateParams) => ZodTuple<T, null>;
declare const recordType: typeof ZodRecord.create;
declare const mapType: <Key extends ZodTypeAny = ZodTypeAny, Value extends ZodTypeAny = ZodTypeAny>(keyType: Key, valueType: Value, params?: RawCreateParams) => ZodMap<Key, Value>;
declare const setType: <Value extends ZodTypeAny = ZodTypeAny>(valueType: Value, params?: RawCreateParams) => ZodSet<Value>;
declare const functionType: typeof ZodFunction.create;
declare const lazyType: <T extends ZodTypeAny>(getter: () => T, params?: RawCreateParams) => ZodLazy<T>;
declare const literalType: <T extends Primitive>(value: T, params?: RawCreateParams) => ZodLiteral<T>;
declare const enumType: typeof createZodEnum;
declare const nativeEnumType: <T extends EnumLike>(values: T, params?: RawCreateParams) => ZodNativeEnum<T>;
declare const promiseType: <T extends ZodTypeAny>(schema: T, params?: RawCreateParams) => ZodPromise<T>;
declare const effectsType: <I extends ZodTypeAny>(schema: I, effect: Effect<I["_output"]>, params?: RawCreateParams) => ZodEffects<I, I["_output"], input<I>>;
declare const optionalType: <T extends ZodTypeAny>(type: T, params?: RawCreateParams) => ZodOptional<T>;
declare const nullableType: <T extends ZodTypeAny>(type: T, params?: RawCreateParams) => ZodNullable<T>;
declare const preprocessType: <I extends ZodTypeAny>(preprocess: (arg: unknown, ctx: RefinementCtx) => unknown, schema: I, params?: RawCreateParams) => ZodEffects<I, I["_output"], unknown>;
declare const pipelineType: typeof ZodPipeline.create;
declare const ostring: () => ZodOptional<ZodString>;
declare const onumber: () => ZodOptional<ZodNumber>;
declare const oboolean: () => ZodOptional<ZodBoolean>;
declare const coerce: {
    string: (params?: RawCreateParams & {
        coerce?: true;
    }) => ZodString;
    number: (params?: RawCreateParams & {
        coerce?: boolean;
    }) => ZodNumber;
    boolean: (params?: RawCreateParams & {
        coerce?: boolean;
    }) => ZodBoolean;
    bigint: (params?: RawCreateParams & {
        coerce?: boolean;
    }) => ZodBigInt;
    date: (params?: RawCreateParams & {
        coerce?: boolean;
    }) => ZodDate;
};

declare const NEVER: never;

type z_AnyZodObject = AnyZodObject;
type z_AnyZodTuple = AnyZodTuple;
type z_ArrayCardinality = ArrayCardinality;
type z_ArrayKeys = ArrayKeys;
type z_AssertArray<T> = AssertArray<T>;
type z_AsyncParseReturnType<T> = AsyncParseReturnType<T>;
type z_BRAND<T extends string | number | symbol> = BRAND<T>;
type z_CatchallInput<T extends ZodTypeAny> = CatchallInput<T>;
type z_CatchallOutput<T extends ZodTypeAny> = CatchallOutput<T>;
type z_CustomErrorParams = CustomErrorParams;
declare const z_DIRTY: typeof DIRTY;
type z_DefaultProps = DefaultProps;
type z_DenormalizedError = DenormalizedError;
declare const z_EMPTY_PATH: typeof EMPTY_PATH;
type z_Effect<T> = Effect<T>;
type z_EnumLike = EnumLike;
type z_EnumValues = EnumValues;
type z_ErrorMapCtx = ErrorMapCtx;
type z_FilterEnum<Values, ToExclude> = FilterEnum<Values, ToExclude>;
declare const z_INVALID: typeof INVALID;
type z_Indices<T> = Indices<T>;
type z_InnerTypeOfFunction<Args extends ZodTuple<any, any>, Returns extends ZodTypeAny> = InnerTypeOfFunction<Args, Returns>;
type z_InputTypeOfTuple<T extends ZodTupleItems | [
]> = InputTypeOfTuple<T>;
type z_InputTypeOfTupleWithRest<T extends ZodTupleItems | [
], Rest extends ZodTypeAny | null = null> = InputTypeOfTupleWithRest<T, Rest>;
type z_IpVersion = IpVersion;
type z_IssueData = IssueData;
type z_KeySchema = KeySchema;
declare const z_NEVER: typeof NEVER;
declare const z_OK: typeof OK;
type z_ObjectPair = ObjectPair;
type z_OuterTypeOfFunction<Args extends ZodTuple<any, any>, Returns extends ZodTypeAny> = OuterTypeOfFunction<Args, Returns>;
type z_OutputTypeOfTuple<T extends ZodTupleItems | [
]> = OutputTypeOfTuple<T>;
type z_OutputTypeOfTupleWithRest<T extends ZodTupleItems | [
], Rest extends ZodTypeAny | null = null> = OutputTypeOfTupleWithRest<T, Rest>;
type z_ParseContext = ParseContext;
type z_ParseInput = ParseInput;
type z_ParseParams = ParseParams;
type z_ParsePath = ParsePath;
type z_ParsePathComponent = ParsePathComponent;
type z_ParseResult = ParseResult;
type z_ParseReturnType<T> = ParseReturnType<T>;
type z_ParseStatus = ParseStatus;
declare const z_ParseStatus: typeof ParseStatus;
type z_PassthroughType<T extends UnknownKeysParam> = PassthroughType<T>;
type z_PreprocessEffect<T> = PreprocessEffect<T>;
type z_Primitive = Primitive;
type z_ProcessedCreateParams = ProcessedCreateParams;
type z_RawCreateParams = RawCreateParams;
type z_RecordType<K extends string | number | symbol, V> = RecordType<K, V>;
type z_Refinement<T> = Refinement<T>;
type z_RefinementCtx = RefinementCtx;
type z_RefinementEffect<T> = RefinementEffect<T>;
type z_SafeParseError<Input> = SafeParseError<Input>;
type z_SafeParseReturnType<Input, Output> = SafeParseReturnType<Input, Output>;
type z_SafeParseSuccess<Output> = SafeParseSuccess<Output>;
type z_Scalars = Scalars;
type z_SomeZodObject = SomeZodObject;
type z_StringValidation = StringValidation;
type z_SuperRefinement<T> = SuperRefinement<T>;
type z_SyncParseReturnType<T = any> = SyncParseReturnType<T>;
type z_TransformEffect<T> = TransformEffect<T>;
type z_TypeOf<T extends ZodType<any, any, any>> = TypeOf<T>;
type z_UnknownKeysParam = UnknownKeysParam;
type z_Values<T extends EnumValues> = Values<T>;
type z_Writeable<T> = Writeable<T>;
type z_ZodAny = ZodAny;
declare const z_ZodAny: typeof ZodAny;
type z_ZodAnyDef = ZodAnyDef;
type z_ZodArray<T extends ZodTypeAny, Cardinality extends ArrayCardinality = "many"> = ZodArray<T, Cardinality>;
declare const z_ZodArray: typeof ZodArray;
type z_ZodArrayDef<T extends ZodTypeAny = ZodTypeAny> = ZodArrayDef<T>;
type z_ZodBigInt = ZodBigInt;
declare const z_ZodBigInt: typeof ZodBigInt;
type z_ZodBigIntCheck = ZodBigIntCheck;
type z_ZodBigIntDef = ZodBigIntDef;
type z_ZodBoolean = ZodBoolean;
declare const z_ZodBoolean: typeof ZodBoolean;
type z_ZodBooleanDef = ZodBooleanDef;
type z_ZodBranded<T extends ZodTypeAny, B extends string | number | symbol> = ZodBranded<T, B>;
declare const z_ZodBranded: typeof ZodBranded;
type z_ZodBrandedDef<T extends ZodTypeAny> = ZodBrandedDef<T>;
type z_ZodCatch<T extends ZodTypeAny> = ZodCatch<T>;
declare const z_ZodCatch: typeof ZodCatch;
type z_ZodCatchDef<T extends ZodTypeAny = ZodTypeAny> = ZodCatchDef<T>;
type z_ZodCustomIssue = ZodCustomIssue;
type z_ZodDate = ZodDate;
declare const z_ZodDate: typeof ZodDate;
type z_ZodDateCheck = ZodDateCheck;
type z_ZodDateDef = ZodDateDef;
type z_ZodDefault<T extends ZodTypeAny> = ZodDefault<T>;
declare const z_ZodDefault: typeof ZodDefault;
type z_ZodDefaultDef<T extends ZodTypeAny = ZodTypeAny> = ZodDefaultDef<T>;
type z_ZodDiscriminatedUnion<Discriminator extends string, Options extends ZodDiscriminatedUnionOption<Discriminator>[]> = ZodDiscriminatedUnion<Discriminator, Options>;
declare const z_ZodDiscriminatedUnion: typeof ZodDiscriminatedUnion;
type z_ZodDiscriminatedUnionDef<Discriminator extends string, Options extends ZodDiscriminatedUnionOption<string>[] = ZodDiscriminatedUnionOption<string>[]> = ZodDiscriminatedUnionDef<Discriminator, Options>;
type z_ZodDiscriminatedUnionOption<Discriminator extends string> = ZodDiscriminatedUnionOption<Discriminator>;
type z_ZodEffects<T extends ZodTypeAny, Output = output<T>, Input = input<T>> = ZodEffects<T, Output, Input>;
declare const z_ZodEffects: typeof ZodEffects;
type z_ZodEffectsDef<T extends ZodTypeAny = ZodTypeAny> = ZodEffectsDef<T>;
type z_ZodEnum<T extends [
    string,
    ...string[]
]> = ZodEnum<T>;
declare const z_ZodEnum: typeof ZodEnum;
type z_ZodEnumDef<T extends EnumValues = EnumValues> = ZodEnumDef<T>;
type z_ZodError<T = any> = ZodError<T>;
declare const z_ZodError: typeof ZodError;
type z_ZodErrorMap = ZodErrorMap;
type z_ZodFirstPartySchemaTypes = ZodFirstPartySchemaTypes;
type z_ZodFirstPartyTypeKind = ZodFirstPartyTypeKind;
declare const z_ZodFirstPartyTypeKind: typeof ZodFirstPartyTypeKind;
type z_ZodFormattedError<T, U = string> = ZodFormattedError<T, U>;
type z_ZodFunction<Args extends ZodTuple<any, any>, Returns extends ZodTypeAny> = ZodFunction<Args, Returns>;
declare const z_ZodFunction: typeof ZodFunction;
type z_ZodFunctionDef<Args extends ZodTuple<any, any> = ZodTuple<any, any>, Returns extends ZodTypeAny = ZodTypeAny> = ZodFunctionDef<Args, Returns>;
type z_ZodIntersection<T extends ZodTypeAny, U extends ZodTypeAny> = ZodIntersection<T, U>;
declare const z_ZodIntersection: typeof ZodIntersection;
type z_ZodIntersectionDef<T extends ZodTypeAny = ZodTypeAny, U extends ZodTypeAny = ZodTypeAny> = ZodIntersectionDef<T, U>;
type z_ZodInvalidArgumentsIssue = ZodInvalidArgumentsIssue;
type z_ZodInvalidDateIssue = ZodInvalidDateIssue;
type z_ZodInvalidEnumValueIssue = ZodInvalidEnumValueIssue;
type z_ZodInvalidIntersectionTypesIssue = ZodInvalidIntersectionTypesIssue;
type z_ZodInvalidLiteralIssue = ZodInvalidLiteralIssue;
type z_ZodInvalidReturnTypeIssue = ZodInvalidReturnTypeIssue;
type z_ZodInvalidStringIssue = ZodInvalidStringIssue;
type z_ZodInvalidTypeIssue = ZodInvalidTypeIssue;
type z_ZodInvalidUnionDiscriminatorIssue = ZodInvalidUnionDiscriminatorIssue;
type z_ZodInvalidUnionIssue = ZodInvalidUnionIssue;
type z_ZodIssue = ZodIssue;
type z_ZodIssueBase = ZodIssueBase;
type z_ZodIssueCode = ZodIssueCode;
type z_ZodIssueOptionalMessage = ZodIssueOptionalMessage;
type z_ZodLazy<T extends ZodTypeAny> = ZodLazy<T>;
declare const z_ZodLazy: typeof ZodLazy;
type z_ZodLazyDef<T extends ZodTypeAny = ZodTypeAny> = ZodLazyDef<T>;
type z_ZodLiteral<T> = ZodLiteral<T>;
declare const z_ZodLiteral: typeof ZodLiteral;
type z_ZodLiteralDef<T = any> = ZodLiteralDef<T>;
type z_ZodMap<Key extends ZodTypeAny = ZodTypeAny, Value extends ZodTypeAny = ZodTypeAny> = ZodMap<Key, Value>;
declare const z_ZodMap: typeof ZodMap;
type z_ZodMapDef<Key extends ZodTypeAny = ZodTypeAny, Value extends ZodTypeAny = ZodTypeAny> = ZodMapDef<Key, Value>;
type z_ZodNaN = ZodNaN;
declare const z_ZodNaN: typeof ZodNaN;
type z_ZodNaNDef = ZodNaNDef;
type z_ZodNativeEnum<T extends EnumLike> = ZodNativeEnum<T>;
declare const z_ZodNativeEnum: typeof ZodNativeEnum;
type z_ZodNativeEnumDef<T extends EnumLike = EnumLike> = ZodNativeEnumDef<T>;
type z_ZodNever = ZodNever;
declare const z_ZodNever: typeof ZodNever;
type z_ZodNeverDef = ZodNeverDef;
type z_ZodNonEmptyArray<T extends ZodTypeAny> = ZodNonEmptyArray<T>;
type z_ZodNotFiniteIssue = ZodNotFiniteIssue;
type z_ZodNotMultipleOfIssue = ZodNotMultipleOfIssue;
type z_ZodNull = ZodNull;
declare const z_ZodNull: typeof ZodNull;
type z_ZodNullDef = ZodNullDef;
type z_ZodNullable<T extends ZodTypeAny> = ZodNullable<T>;
declare const z_ZodNullable: typeof ZodNullable;
type z_ZodNullableDef<T extends ZodTypeAny = ZodTypeAny> = ZodNullableDef<T>;
type z_ZodNullableType<T extends ZodTypeAny> = ZodNullableType<T>;
type z_ZodNumber = ZodNumber;
declare const z_ZodNumber: typeof ZodNumber;
type z_ZodNumberCheck = ZodNumberCheck;
type z_ZodNumberDef = ZodNumberDef;
type z_ZodObject<T extends ZodRawShape, UnknownKeys extends UnknownKeysParam = UnknownKeysParam, Catchall extends ZodTypeAny = ZodTypeAny, Output = objectOutputType<T, Catchall, UnknownKeys>, Input = objectInputType<T, Catchall, UnknownKeys>> = ZodObject<T, UnknownKeys, Catchall, Output, Input>;
declare const z_ZodObject: typeof ZodObject;
type z_ZodObjectDef<T extends ZodRawShape = ZodRawShape, UnknownKeys extends UnknownKeysParam = UnknownKeysParam, Catchall extends ZodTypeAny = ZodTypeAny> = ZodObjectDef<T, UnknownKeys, Catchall>;
type z_ZodOptional<T extends ZodTypeAny> = ZodOptional<T>;
declare const z_ZodOptional: typeof ZodOptional;
type z_ZodOptionalDef<T extends ZodTypeAny = ZodTypeAny> = ZodOptionalDef<T>;
type z_ZodOptionalType<T extends ZodTypeAny> = ZodOptionalType<T>;
type z_ZodParsedType = ZodParsedType;
type z_ZodPipeline<A extends ZodTypeAny, B extends ZodTypeAny> = ZodPipeline<A, B>;
declare const z_ZodPipeline: typeof ZodPipeline;
type z_ZodPipelineDef<A extends ZodTypeAny, B extends ZodTypeAny> = ZodPipelineDef<A, B>;
type z_ZodPromise<T extends ZodTypeAny> = ZodPromise<T>;
declare const z_ZodPromise: typeof ZodPromise;
type z_ZodPromiseDef<T extends ZodTypeAny = ZodTypeAny> = ZodPromiseDef<T>;
type z_ZodRawShape = ZodRawShape;
type z_ZodReadonly<T extends ZodTypeAny> = ZodReadonly<T>;
declare const z_ZodReadonly: typeof ZodReadonly;
type z_ZodReadonlyDef<T extends ZodTypeAny = ZodTypeAny> = ZodReadonlyDef<T>;
type z_ZodRecord<Key extends KeySchema = ZodString, Value extends ZodTypeAny = ZodTypeAny> = ZodRecord<Key, Value>;
declare const z_ZodRecord: typeof ZodRecord;
type z_ZodRecordDef<Key extends KeySchema = ZodString, Value extends ZodTypeAny = ZodTypeAny> = ZodRecordDef<Key, Value>;
type z_ZodSet<Value extends ZodTypeAny = ZodTypeAny> = ZodSet<Value>;
declare const z_ZodSet: typeof ZodSet;
type z_ZodSetDef<Value extends ZodTypeAny = ZodTypeAny> = ZodSetDef<Value>;
type z_ZodString = ZodString;
declare const z_ZodString: typeof ZodString;
type z_ZodStringCheck = ZodStringCheck;
type z_ZodStringDef = ZodStringDef;
type z_ZodSymbol = ZodSymbol;
declare const z_ZodSymbol: typeof ZodSymbol;
type z_ZodSymbolDef = ZodSymbolDef;
type z_ZodTooBigIssue = ZodTooBigIssue;
type z_ZodTooSmallIssue = ZodTooSmallIssue;
type z_ZodTuple<T extends [
    ZodTypeAny,
    ...ZodTypeAny[]
] | [
] = [
    ZodTypeAny,
    ...ZodTypeAny[]
], Rest extends ZodTypeAny | null = null> = ZodTuple<T, Rest>;
declare const z_ZodTuple: typeof ZodTuple;
type z_ZodTupleDef<T extends ZodTupleItems | [
] = ZodTupleItems, Rest extends ZodTypeAny | null = null> = ZodTupleDef<T, Rest>;
type z_ZodTupleItems = ZodTupleItems;
type z_ZodType<Output = any, Def extends ZodTypeDef = ZodTypeDef, Input = Output> = ZodType<Output, Def, Input>;
declare const z_ZodType: typeof ZodType;
type z_ZodTypeAny = ZodTypeAny;
type z_ZodTypeDef = ZodTypeDef;
type z_ZodUndefined = ZodUndefined;
declare const z_ZodUndefined: typeof ZodUndefined;
type z_ZodUndefinedDef = ZodUndefinedDef;
type z_ZodUnion<T extends ZodUnionOptions> = ZodUnion<T>;
declare const z_ZodUnion: typeof ZodUnion;
type z_ZodUnionDef<T extends ZodUnionOptions = Readonly<[
    ZodTypeAny,
    ZodTypeAny,
    ...ZodTypeAny[]
]>> = ZodUnionDef<T>;
type z_ZodUnionOptions = ZodUnionOptions;
type z_ZodUnknown = ZodUnknown;
declare const z_ZodUnknown: typeof ZodUnknown;
type z_ZodUnknownDef = ZodUnknownDef;
type z_ZodUnrecognizedKeysIssue = ZodUnrecognizedKeysIssue;
type z_ZodVoid = ZodVoid;
declare const z_ZodVoid: typeof ZodVoid;
type z_ZodVoidDef = ZodVoidDef;
declare const z_addIssueToContext: typeof addIssueToContext;
type z_arrayOutputType<T extends ZodTypeAny, Cardinality extends ArrayCardinality = "many"> = arrayOutputType<T, Cardinality>;
type z_baseObjectInputType<Shape extends ZodRawShape> = baseObjectInputType<Shape>;
type z_baseObjectOutputType<Shape extends ZodRawShape> = baseObjectOutputType<Shape>;
declare const z_coerce: typeof coerce;
declare const z_custom: typeof custom;
type z_deoptional<T extends ZodTypeAny> = deoptional<T>;
declare const z_getErrorMap: typeof getErrorMap;
declare const z_getParsedType: typeof getParsedType;
type z_inferFlattenedErrors<T extends ZodType<any, any, any>, U = string> = inferFlattenedErrors<T, U>;
type z_inferFormattedError<T extends ZodType<any, any, any>, U = string> = inferFormattedError<T, U>;
type z_input<T extends ZodType<any, any, any>> = input<T>;
declare const z_isAborted: typeof isAborted;
declare const z_isAsync: typeof isAsync;
declare const z_isDirty: typeof isDirty;
declare const z_isValid: typeof isValid;
declare const z_late: typeof late;
declare const z_makeIssue: typeof makeIssue;
type z_mergeTypes<A, B> = mergeTypes<A, B>;
type z_noUnrecognized<Obj extends object, Shape extends object> = noUnrecognized<Obj, Shape>;
type z_objectInputType<Shape extends ZodRawShape, Catchall extends ZodTypeAny, UnknownKeys extends UnknownKeysParam = UnknownKeysParam> = objectInputType<Shape, Catchall, UnknownKeys>;
type z_objectOutputType<Shape extends ZodRawShape, Catchall extends ZodTypeAny, UnknownKeys extends UnknownKeysParam = UnknownKeysParam> = objectOutputType<Shape, Catchall, UnknownKeys>;
declare const z_objectUtil: typeof objectUtil;
declare const z_oboolean: typeof oboolean;
declare const z_onumber: typeof onumber;
declare const z_ostring: typeof ostring;
type z_output<T extends ZodType<any, any, any>> = output<T>;
declare const z_quotelessJson: typeof quotelessJson;
declare const z_setErrorMap: typeof setErrorMap;
type z_typeToFlattenedError<T, U = string> = typeToFlattenedError<T, U>;
type z_typecast<A, T> = typecast<A, T>;
declare const z_util: typeof util;
declare namespace z {
  export { type z_AnyZodObject as AnyZodObject, type z_AnyZodTuple as AnyZodTuple, type z_ArrayCardinality as ArrayCardinality, type z_ArrayKeys as ArrayKeys, type z_AssertArray as AssertArray, type z_AsyncParseReturnType as AsyncParseReturnType, type z_BRAND as BRAND, type z_CatchallInput as CatchallInput, type z_CatchallOutput as CatchallOutput, type z_CustomErrorParams as CustomErrorParams, z_DIRTY as DIRTY, type z_DefaultProps as DefaultProps, type z_DenormalizedError as DenormalizedError, z_EMPTY_PATH as EMPTY_PATH, type z_Effect as Effect, type z_EnumLike as EnumLike, type z_EnumValues as EnumValues, type z_ErrorMapCtx as ErrorMapCtx, type z_FilterEnum as FilterEnum, z_INVALID as INVALID, type z_Indices as Indices, type z_InnerTypeOfFunction as InnerTypeOfFunction, type z_InputTypeOfTuple as InputTypeOfTuple, type z_InputTypeOfTupleWithRest as InputTypeOfTupleWithRest, type z_IpVersion as IpVersion, type z_IssueData as IssueData, type z_KeySchema as KeySchema, z_NEVER as NEVER, z_OK as OK, type z_ObjectPair as ObjectPair, type z_OuterTypeOfFunction as OuterTypeOfFunction, type z_OutputTypeOfTuple as OutputTypeOfTuple, type z_OutputTypeOfTupleWithRest as OutputTypeOfTupleWithRest, type z_ParseContext as ParseContext, type z_ParseInput as ParseInput, type z_ParseParams as ParseParams, type z_ParsePath as ParsePath, type z_ParsePathComponent as ParsePathComponent, type z_ParseResult as ParseResult, type z_ParseReturnType as ParseReturnType, z_ParseStatus as ParseStatus, type z_PassthroughType as PassthroughType, type z_PreprocessEffect as PreprocessEffect, type z_Primitive as Primitive, type z_ProcessedCreateParams as ProcessedCreateParams, type z_RawCreateParams as RawCreateParams, type z_RecordType as RecordType, type z_Refinement as Refinement, type z_RefinementCtx as RefinementCtx, type z_RefinementEffect as RefinementEffect, type z_SafeParseError as SafeParseError, type z_SafeParseReturnType as SafeParseReturnType, type z_SafeParseSuccess as SafeParseSuccess, type z_Scalars as Scalars, ZodType as Schema, type z_SomeZodObject as SomeZodObject, type z_StringValidation as StringValidation, type z_SuperRefinement as SuperRefinement, type z_SyncParseReturnType as SyncParseReturnType, type z_TransformEffect as TransformEffect, type z_TypeOf as TypeOf, type z_UnknownKeysParam as UnknownKeysParam, type z_Values as Values, type z_Writeable as Writeable, z_ZodAny as ZodAny, type z_ZodAnyDef as ZodAnyDef, z_ZodArray as ZodArray, type z_ZodArrayDef as ZodArrayDef, z_ZodBigInt as ZodBigInt, type z_ZodBigIntCheck as ZodBigIntCheck, type z_ZodBigIntDef as ZodBigIntDef, z_ZodBoolean as ZodBoolean, type z_ZodBooleanDef as ZodBooleanDef, z_ZodBranded as ZodBranded, type z_ZodBrandedDef as ZodBrandedDef, z_ZodCatch as ZodCatch, type z_ZodCatchDef as ZodCatchDef, type z_ZodCustomIssue as ZodCustomIssue, z_ZodDate as ZodDate, type z_ZodDateCheck as ZodDateCheck, type z_ZodDateDef as ZodDateDef, z_ZodDefault as ZodDefault, type z_ZodDefaultDef as ZodDefaultDef, z_ZodDiscriminatedUnion as ZodDiscriminatedUnion, type z_ZodDiscriminatedUnionDef as ZodDiscriminatedUnionDef, type z_ZodDiscriminatedUnionOption as ZodDiscriminatedUnionOption, z_ZodEffects as ZodEffects, type z_ZodEffectsDef as ZodEffectsDef, z_ZodEnum as ZodEnum, type z_ZodEnumDef as ZodEnumDef, z_ZodError as ZodError, type z_ZodErrorMap as ZodErrorMap, type z_ZodFirstPartySchemaTypes as ZodFirstPartySchemaTypes, z_ZodFirstPartyTypeKind as ZodFirstPartyTypeKind, type z_ZodFormattedError as ZodFormattedError, z_ZodFunction as ZodFunction, type z_ZodFunctionDef as ZodFunctionDef, z_ZodIntersection as ZodIntersection, type z_ZodIntersectionDef as ZodIntersectionDef, type z_ZodInvalidArgumentsIssue as ZodInvalidArgumentsIssue, type z_ZodInvalidDateIssue as ZodInvalidDateIssue, type z_ZodInvalidEnumValueIssue as ZodInvalidEnumValueIssue, type z_ZodInvalidIntersectionTypesIssue as ZodInvalidIntersectionTypesIssue, type z_ZodInvalidLiteralIssue as ZodInvalidLiteralIssue, type z_ZodInvalidReturnTypeIssue as ZodInvalidReturnTypeIssue, type z_ZodInvalidStringIssue as ZodInvalidStringIssue, type z_ZodInvalidTypeIssue as ZodInvalidTypeIssue, type z_ZodInvalidUnionDiscriminatorIssue as ZodInvalidUnionDiscriminatorIssue, type z_ZodInvalidUnionIssue as ZodInvalidUnionIssue, type z_ZodIssue as ZodIssue, type z_ZodIssueBase as ZodIssueBase, type z_ZodIssueCode as ZodIssueCode, type z_ZodIssueOptionalMessage as ZodIssueOptionalMessage, z_ZodLazy as ZodLazy, type z_ZodLazyDef as ZodLazyDef, z_ZodLiteral as ZodLiteral, type z_ZodLiteralDef as ZodLiteralDef, z_ZodMap as ZodMap, type z_ZodMapDef as ZodMapDef, z_ZodNaN as ZodNaN, type z_ZodNaNDef as ZodNaNDef, z_ZodNativeEnum as ZodNativeEnum, type z_ZodNativeEnumDef as ZodNativeEnumDef, z_ZodNever as ZodNever, type z_ZodNeverDef as ZodNeverDef, type z_ZodNonEmptyArray as ZodNonEmptyArray, type z_ZodNotFiniteIssue as ZodNotFiniteIssue, type z_ZodNotMultipleOfIssue as ZodNotMultipleOfIssue, z_ZodNull as ZodNull, type z_ZodNullDef as ZodNullDef, z_ZodNullable as ZodNullable, type z_ZodNullableDef as ZodNullableDef, type z_ZodNullableType as ZodNullableType, z_ZodNumber as ZodNumber, type z_ZodNumberCheck as ZodNumberCheck, type z_ZodNumberDef as ZodNumberDef, z_ZodObject as ZodObject, type z_ZodObjectDef as ZodObjectDef, z_ZodOptional as ZodOptional, type z_ZodOptionalDef as ZodOptionalDef, type z_ZodOptionalType as ZodOptionalType, type z_ZodParsedType as ZodParsedType, z_ZodPipeline as ZodPipeline, type z_ZodPipelineDef as ZodPipelineDef, z_ZodPromise as ZodPromise, type z_ZodPromiseDef as ZodPromiseDef, type z_ZodRawShape as ZodRawShape, z_ZodReadonly as ZodReadonly, type z_ZodReadonlyDef as ZodReadonlyDef, z_ZodRecord as ZodRecord, type z_ZodRecordDef as ZodRecordDef, ZodType as ZodSchema, z_ZodSet as ZodSet, type z_ZodSetDef as ZodSetDef, z_ZodString as ZodString, type z_ZodStringCheck as ZodStringCheck, type z_ZodStringDef as ZodStringDef, z_ZodSymbol as ZodSymbol, type z_ZodSymbolDef as ZodSymbolDef, type z_ZodTooBigIssue as ZodTooBigIssue, type z_ZodTooSmallIssue as ZodTooSmallIssue, ZodEffects as ZodTransformer, z_ZodTuple as ZodTuple, type z_ZodTupleDef as ZodTupleDef, type z_ZodTupleItems as ZodTupleItems, z_ZodType as ZodType, type z_ZodTypeAny as ZodTypeAny, type z_ZodTypeDef as ZodTypeDef, z_ZodUndefined as ZodUndefined, type z_ZodUndefinedDef as ZodUndefinedDef, z_ZodUnion as ZodUnion, type z_ZodUnionDef as ZodUnionDef, type z_ZodUnionOptions as ZodUnionOptions, z_ZodUnknown as ZodUnknown, type z_ZodUnknownDef as ZodUnknownDef, type z_ZodUnrecognizedKeysIssue as ZodUnrecognizedKeysIssue, z_ZodVoid as ZodVoid, type z_ZodVoidDef as ZodVoidDef, z_addIssueToContext as addIssueToContext, anyType as any, arrayType as array, type z_arrayOutputType as arrayOutputType, type z_baseObjectInputType as baseObjectInputType, type z_baseObjectOutputType as baseObjectOutputType, bigIntType as bigint, booleanType as boolean, z_coerce as coerce, z_custom as custom, dateType as date, errorMap as defaultErrorMap, type z_deoptional as deoptional, discriminatedUnionType as discriminatedUnion, effectsType as effect, enumType as enum, functionType as function, z_getErrorMap as getErrorMap, z_getParsedType as getParsedType, type TypeOf as infer, type z_inferFlattenedErrors as inferFlattenedErrors, type z_inferFormattedError as inferFormattedError, type z_input as input, instanceOfType as instanceof, intersectionType as intersection, z_isAborted as isAborted, z_isAsync as isAsync, z_isDirty as isDirty, z_isValid as isValid, z_late as late, lazyType as lazy, literalType as literal, z_makeIssue as makeIssue, mapType as map, type z_mergeTypes as mergeTypes, nanType as nan, nativeEnumType as nativeEnum, neverType as never, type z_noUnrecognized as noUnrecognized, nullType as null, nullableType as nullable, numberType as number, objectType as object, type z_objectInputType as objectInputType, type z_objectOutputType as objectOutputType, z_objectUtil as objectUtil, z_oboolean as oboolean, z_onumber as onumber, optionalType as optional, z_ostring as ostring, type z_output as output, pipelineType as pipeline, preprocessType as preprocess, promiseType as promise, z_quotelessJson as quotelessJson, recordType as record, setType as set, z_setErrorMap as setErrorMap, strictObjectType as strictObject, stringType as string, symbolType as symbol, effectsType as transformer, tupleType as tuple, type z_typeToFlattenedError as typeToFlattenedError, type z_typecast as typecast, undefinedType as undefined, unionType as union, unknownType as unknown, z_util as util, voidType as void };
}

type StoreObj = Record<string, ZodType<any> | Function>;
interface Skip<T extends StoreObj, key extends keyof T = keyof T> {
    key: keyof T;
    get: () => T[key] extends ZodType<any> ? TypeOf<T[key]> : T[key];
    set?: (value: T[key] extends ZodType<any> ? TypeOf<T[key]> : T[key]) => boolean;
}
type Skips<T extends StoreObj> = Skip<T>[];
type DefaultOutput<T extends StoreObj> = {
    [K in keyof T]: T[K] extends ZodType<any> ? TypeOf<T[K]> : T[K];
};
declare function createZodStore<T extends StoreObj = StoreObj, Output = DefaultOutput<T>>(obj: T, skip?: Skips<T>): Output;
declare const createZodKeyStore: <T extends ZodType<any, ZodTypeDef, any>>(type: T) => {
    getAll: () => Promise<Record<string, TypeOf<T>>>;
    awaitForAvailability(key: string): Promise<TypeOf<T>>;
    getKey(key: string): Promise<TypeOf<T> | null>;
    setKey(key: string, value: TypeOf<T>): Promise<void>;
    getOrSet(key: string, fn: () => TypeOf<T> | Promise<TypeOf<T>>): Promise<TypeOf<T>>;
};
declare const createGlobalZodStore: <T extends StoreObj>(obj: T, key: string) => Promise<DefaultOutput<T>>;
declare const createGlobalZodKeyStore: <T extends ZodType<any, ZodTypeDef, any>>(obj: T, key: string) => Promise<{
    getAll: () => Promise<Record<string, TypeOf<T>>>;
    awaitForAvailability(key: string): Promise<TypeOf<T>>;
    getKey(key: string): Promise<TypeOf<T> | null>;
    setKey(key: string, value: TypeOf<T>): Promise<void>;
    getOrSet(key: string, fn: () => TypeOf<T> | Promise<TypeOf<T>>): Promise<TypeOf<T>>;
}>;

type ArrayToZod<T extends Readonly<any[]>> = {
    [K in keyof T]: valueToZod<T[K]>;
};
type ArrayToZodArray<U extends Readonly<List$1<any>>, AddUnion = 1, length extends number = Length<U>, head = U[0]> = length extends 1 ? valueToZod<head> : U extends [...infer R, null] ? ZodOptional<ArrayToZodArray<R>> | ZodDefault<ZodOptional<ArrayToZodArray<R>>> : U extends [null, ...infer R] ? ZodOptional<ArrayToZodArray<R>> | ZodDefault<ZodOptional<ArrayToZodArray<R>>> : AddUnion extends 1 ? ZodDefault<ZodUnion<GenericArray<ArrayToZod<U>>>> : ZodType<U> | ArrayToZod<U>;
type ValueToZodArray<T, AddUnion = 1, U extends List$1<any> = ListOf<combineNullUndefined<T>>> = ArrayToZodArray<U, AddUnion>;
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
type valueToConfig<T> = valueToZod<T> extends zodLazy<infer X> ? (X extends ZodObject<any> ? X : never) : never;
type zodKey<T> = true extends If<isAny<T>, true> ? "unknown" : true extends If<Is<T, never, "equals">, true> ? "unknown" : true extends hasManyItems<T> ? "many" : true extends If<Is<T, null | undefined, "extends->">, true> ? "nullOrUndefined" : true extends isTrueAndFalse<T> ? "boolean" : true extends isTrueOnly<T> ? "true" : true extends isFalseOnly<T> ? "false" : T extends string & {
    __type: "modulename";
} ? "modulename" : true extends If<IsLiteral<T>, true> ? "literal" : T extends any[] ? isTuple<T> extends true ? "tuple" : "array" : true extends If<Is<T, Date, "equals">, true> ? "date" : true extends If<Is<T, string, "equals">, true> ? "string" : true extends If<Is<T, number, "equals">, true> ? "number" : true extends If<Is<T, void, "equals">, true> ? "void" : T extends {
    [k: string]: any;
} ? "object" : "unknown";

type withoutNever<T> = {
    [P in keyof T as T[P] extends never ? never : P]: T[P];
};

type CreateModule<Name extends ModuleName, Definition, Config extends ModuleConfigValue<Config>, RequiredModules extends AnyModule[] = [], OptionalModules extends AnyModule[] = [], MergedInterface extends ModuleContextInterface<MergedInterface> = MergeOutsideInterface<Definition, RequiredModules, OptionalModules>, MergedConfig extends Config = MergeConfig<Config, RequiredModules, OptionalModules>, NewConfig extends AnyModuleConfig = ModuleConfig<Config, MergedConfig, getConfigImplementation<Config>, getConfigImplementation<MergedConfig>>, OutsideInterface extends ModuleOutsideInterface<MergedInterface> = getOutSideInterface<MergedInterface, MergedConfig>, MergedImplement = getImplementation<OutsideInterface, OutsideInterface>, Implementation extends SubsetKeys<OutsideInterface, Implementation> = getImplementation<OutsideInterface, Definition>, NewContext = ModuleContext<Definition, MergedInterface, OutsideInterface, Implementation, MergedImplement>> = Simplify<Module<Name, Definition, NewConfig, NewContext, RequiredModules, OptionalModules>>;
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

declare function createModuleName<T extends string>(name: T): T;
declare function createConfig<Module extends AnyModule, ConfigImplement = Module["Config"]["Implement"]>(fn: (prop: {
    z: typeof z;
}) => ConfigImplement): (prop: {
    z: typeof z;
}) => ConfigImplement;
declare function createContext<Module extends AnyModule, ContextImplement = Module["Context"]["Implement"]>(fn: (prop: {
    z: typeof z;
    fn: <Value = undefined, Output = undefined>(props: Parameters<typeof createPipesContextCommand<Module, Value, Output>>[0]) => ReturnType<typeof createPipesContextCommand<Module, Value, Output>>;
}) => ContextImplement): typeof fn;
declare const _createModule: <NewModule extends AnyModule, ConfigImplement = NewModule["Config"]["Implement"], ContextImplement = NewModule["Context"]["Implement"], RequiredNames extends string[] = NewModule["RequiredModules"][number]["ModuleName"] extends never ? [] : NewModule["RequiredModules"][number]["ModuleName"][], OptionalNames extends string[] = NewModule["OptionalModules"][number]["ModuleName"] extends never ? [] : NewModule["OptionalModules"][number]["ModuleName"][]>({ name, config, context, required, optional, }: {
    name: NewModule["ModuleName"];
    config: (value: {
        z: typeof z;
    }) => ConfigImplement;
    context: (value: {
        z: typeof z;
        fn: <Value = undefined, Output = undefined>(props: {
            value?: (undefined extends Value ? Value & undefined : valueToZod<Value>) | undefined;
            output?: valueToZod<Output> | undefined;
            implement: (context: NewModule["Context"]["ContextInterface"], config: NewModule["Config"]["Merged"], _value: Value) => Output;
        }) => PipesContextCommand<NewModule, Value, Output>;
    }) => ContextImplement;
    required?: RequiredNames | undefined;
    optional?: OptionalNames | undefined;
}) => {
    name: NewModule["ModuleName"];
    config: ConfigImplement;
    context: ContextImplement;
    required: RequiredNames;
    optional: OptionalNames;
};
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
    startTime: Date;
    getDurationInMs: () => number;
    client: Client;
    haltAll: () => void;
    modules: ModuleName[];
    stack: string[];
    hasModule: <Module extends AnyModule>(name: moduleNameToString<Module["ModuleName"]>) => boolean;
    imageStore: Promise<ReturnType<typeof createZodKeyStore<z.ZodType<Container>>>>;
    addEnv: (prop: {
        container: Container$1;
        env: [string, string][];
    }) => Container$1;
    addContextToCore: (props: {
        context: {
            run: () => Promise<any>;
        };
    }) => void;
}
interface IPipesCoreConfig {
    appName: string;
    isCI: boolean;
    isPR: boolean;
    env: "github" | "gitlab" | "local";
}
type PipesCoreModule = createModuleDef<"PipesCore", IPipesCoreContext, IPipesCoreConfig>;
declare const PipesCoreConfig: (prop: {
    z: typeof z;
}) => {
    appName: string | (ZodString | ZodDefault<ZodString>);
    isCI: boolean | (ZodBoolean | ZodDefault<ZodBoolean>);
    isPR: boolean | (ZodBoolean | ZodDefault<ZodBoolean>);
    env: "github" | "gitlab" | "local" | ZodDefault<ZodUnion<GenericArray<[ZodLiteral<"github">, ZodLiteral<"gitlab">, ZodLiteral<"local">]>>>;
};
declare const PipesCoreContext: (prop: any) => PipesCoreModule["Context"]["Implement"];
declare const PipesCore: {
    name: PipesCoreModule["ModuleName"];
    config: PipesCoreModule["Config"]["Implement"];
    context: PipesCoreModule["Context"]["Implement"];
};

declare const internalStateSchema: ZodDefault<ZodUnion<[ZodLiteral<"running">, ZodLiteral<"waiting">, ZodLiteral<"waiting_for_dependency">, ZodLiteral<"finished">, ZodLiteral<"failed">]>>;
declare const taskSchema: ZodDefault<ZodArray<ZodSymbol, "many">>;
declare const loaderStateSchema: ZodDefault<ZodUnion<[ZodLiteral<"initializing">, ZodLiteral<"starting">, ZodLiteral<"running">, ZodLiteral<"finished">]>>;
declare const internalStateStoreSchema: ZodObject<{
    name: ZodDefault<ZodString>;
    state: ZodDefault<ZodUnion<[ZodLiteral<"running">, ZodLiteral<"waiting">, ZodLiteral<"waiting_for_dependency">, ZodLiteral<"finished">, ZodLiteral<"failed">]>>;
}, "strip", ZodTypeAny, {
    name: string;
    state: "running" | "waiting" | "waiting_for_dependency" | "finished" | "failed";
}, {
    name?: string | undefined;
    state?: "running" | "waiting" | "waiting_for_dependency" | "finished" | "failed" | undefined;
}>;
declare const stateStoreSchema: {
    symbolsOfTasksCompleted: ZodDefault<ZodArray<ZodSymbol, "many">>;
    symbolsOfTasksFailed: ZodDefault<ZodArray<ZodSymbol, "many">>;
    symbolsOfTasks: ZodDefault<ZodArray<ZodSymbol, "many">>;
    state: ZodDefault<ZodUnion<[ZodLiteral<"initializing">, ZodLiteral<"starting">, ZodLiteral<"running">, ZodLiteral<"finished">]>>;
};
declare function createInternalState(): InternalStateStore;
declare function createState(): LoaderStateStore;

type InternalState = TypeOf<typeof internalStateSchema>;
type LoaderState = TypeOf<typeof loaderStateSchema>;
type TaskSet = symbol[];
type InternalStateStore = {
    state: InternalState;
    name: string;
};
type LoaderStateStore = {
    symbolsOfTasksCompleted: TaskSet;
    symbolsOfTasksFailed: TaskSet;
    symbolsOfTasks: TaskSet;
    state: LoaderState;
};

declare class PipesCoreClass<Modules extends AnyModule[] = [PipesCoreModule], CurrentState extends MergeModules<Modules> = MergeModules<Modules>, CurrentConfig extends CurrentState["Config"] = CurrentState["Config"], CurrentContext extends CurrentState["Context"] = CurrentState["Context"], ScriptFn extends fn$1<CurrentContext["ContextInterface"], CurrentConfig["Merged"]> = fn$1<CurrentContext["ContextInterface"], CurrentConfig["Merged"]>> {
    #private;
    get symbol(): symbol;
    addDependency(value: PipesCoreClass<any> | symbol): this;
    removeDependency(value: PipesCoreClass<any> | symbol): this;
    addScript(fn: ScriptFn): this;
    set haltAll(value: () => void | Promise<void>);
    get haltAll(): () => void;
    addContext: (_context: unknown, _config: unknown, _props: {
        context: PipesCoreClass;
    }) => void;
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
    run(state?: LoaderStateStore, internalState?: InternalStateStore): Promise<void>;
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

declare class PipesError<T extends (...value: any[]) => any> extends Error {
    #private;
    constructor({ parameters, duration, message, error, }: {
        parameters: Parameters<T>;
        message?: string;
        duration: number;
        error?: unknown;
    });
    getPipesError(): {
        message: string;
        error: string | undefined;
        duration: number;
        parameters: Parameters<T> | undefined;
    };
}

declare function timeFunction<T extends (..._args: any[]) => any>(fn: T, name?: string): (...args: Parameters<T>) => {
    timeStarted: Date;
    timeEnded: Date;
    duration: number;
    value: ReturnType<T>;
    name?: string | undefined;
};

declare const createTask: <Context extends {
    getDurationInMs: () => number;
}, Fn extends () => any>(task: Fn, texts: {
    inProgress: string;
    finished: string;
    error: string;
}, context: Context) => Promise<Awaited<ReturnType<Fn>>>;

interface Render {
    stop: () => Promise<void>;
    value: () => string;
}
type RenderValue = ReactNode;
type ValueOrPromise<T> = T | Promise<T>;
type FnOrValue<T> = T | (() => T);
type RenderValueParam = FnOrValue<ValueOrPromise<RenderValue>>;
interface RenderProps {
    renderAsString: boolean;
    forceRenderNow: boolean;
}
declare const render: (node: RenderValueParam, props?: Partial<RenderProps>) => Promise<Render>;

type OutputTransformer = (s: string, index: number) => string;

type Styles = {
    readonly textWrap?: "wrap" | "end" | "middle" | "truncate-end" | "truncate" | "truncate-middle" | "truncate-start";
    readonly position?: "absolute" | "relative";
    readonly columnGap?: number;
    readonly rowGap?: number;
    readonly gap?: number;
    readonly margin?: number;
    readonly marginX?: number;
    readonly marginY?: number;
    readonly marginTop?: number;
    readonly marginBottom?: number;
    readonly marginLeft?: number;
    readonly marginRight?: number;
    readonly padding?: number;
    readonly paddingX?: number;
    readonly paddingY?: number;
    readonly paddingTop?: number;
    readonly paddingBottom?: number;
    readonly paddingLeft?: number;
    readonly paddingRight?: number;
    readonly flexGrow?: number;
    readonly flexShrink?: number;
    readonly flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
    readonly flexBasis?: number | string;
    readonly flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
    readonly alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
    readonly alignSelf?: "flex-start" | "center" | "flex-end" | "auto";
    readonly justifyContent?: "flex-start" | "flex-end" | "space-between" | "space-around" | "center";
    readonly width?: number | string;
    readonly height?: number | string;
    readonly minWidth?: number | string;
    readonly minHeight?: number | string;
    readonly display?: "flex" | "none";
    readonly borderStyle?: keyof Boxes | BoxStyle;
    readonly borderTop?: boolean;
    readonly borderBottom?: boolean;
    readonly borderLeft?: boolean;
    readonly borderRight?: boolean;
    readonly borderColor?: LiteralUnion<ForegroundColorName, string>;
    readonly borderTopColor?: LiteralUnion<ForegroundColorName, string>;
    readonly borderBottomColor?: LiteralUnion<ForegroundColorName, string>;
    readonly borderLeftColor?: LiteralUnion<ForegroundColorName, string>;
    readonly borderRightColor?: LiteralUnion<ForegroundColorName, string>;
    readonly borderDimColor?: boolean;
    readonly borderTopDimColor?: boolean;
    readonly borderBottomDimColor?: boolean;
    readonly borderLeftDimColor?: boolean;
    readonly borderRightDimColor?: boolean;
    readonly overflow?: "visible" | "hidden";
    readonly overflowX?: "visible" | "hidden";
    readonly overflowY?: "visible" | "hidden";
};

type InkNode = {
    parentNode: DOMElement | undefined;
    yogaNode?: Node;
    internal_static?: boolean;
    style: Styles;
};
type TextName = "#text";
type ElementNames = "ink-root" | "ink-box" | "ink-text" | "ink-virtual-text";
type NodeNames = ElementNames | TextName;
type DOMElement = {
    nodeName: ElementNames;
    attributes: Record<string, DOMNodeAttribute>;
    childNodes: DOMNode[];
    internal_transform?: OutputTransformer;
    isStaticDirty?: boolean;
    staticNode?: DOMElement;
    onComputeLayout?: () => void;
    onRender?: () => void;
    onImmediateRender?: () => void;
} & InkNode;
type TextNode = {
    nodeName: TextName;
    nodeValue: string;
} & InkNode;
type DOMNode<T = {
    nodeName: NodeNames;
}> = T extends {
    nodeName: infer U;
} ? U extends "#text" ? TextNode : DOMElement : never;
type DOMNodeAttribute = boolean | string | number;

type Props$1 = Except<Styles, "textWrap">;
declare const Box: React.ForwardRefExoticComponent<Props$1 & {
    children?: React.ReactNode;
} & React.RefAttributes<DOMElement>>;

type Props = {
    readonly color?: LiteralUnion<ForegroundColorName, string>;
    readonly backgroundColor?: LiteralUnion<ForegroundColorName, string>;
    readonly dimColor?: boolean;
    readonly bold?: boolean;
    readonly italic?: boolean;
    readonly underline?: boolean;
    readonly strikethrough?: boolean;
    readonly inverse?: boolean;
    readonly wrap?: Styles["textWrap"];
    readonly children?: ReactNode;
};
declare function Text({ color, backgroundColor, dimColor, bold, italic, underline, strikethrough, inverse, wrap, children, }: Props): JSX.Element | null;

declare const haltAllRender: () => void;

type AnyElement = ReactNode;
type SpecifixJSX<type extends string, props extends Record<string, any> | null, children extends ReactNode | ReactNode[] | undefined> = Simplify<props extends null ? {
    type: type;
} & {
    children: children;
} : {
    type: type;
} & props & {
    children: children;
}>;

type Color$3 = Parameters<typeof Text>[0]["color"];
type BackgroundColor = Parameters<typeof Text>[0]["color"];
type IBadge = SpecifixJSX<"Badge", {
    color?: Color$3;
    backgroundColor?: BackgroundColor;
    display?: "ansi" | "markdown" | undefined;
}, string>;
declare const Badge: (props: Omit<IBadge, "type">) => React.ReactNode;

type Color$2 = Parameters<typeof Box>["0"]["borderColor"];
type IContainer = SpecifixJSX<"Container", {
    color?: Color$2;
    padding?: number;
}, ReactNode | ReactNode[] | null | string>;
declare const Container: (props: Omit<IContainer, "type">) => ReactNode;

type DialogType = "default" | "error" | "success" | "failure";
type DialogProps = {
    dialogType?: DialogType;
    children?: ReactNode | ReactNode[];
    title: string;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
};
type IDialog = {
    type: "Dialog";
} & DialogProps;
declare const Dialog: (props: Omit<IDialog, "type">) => ReactNode;

type IDivider = {
    type: "Divider";
};
declare const Divider: (_props: Omit<IDivider, "type">) => ReactNode;

interface IError {
    type: "Error";
    title?: string | undefined | null;
    children?: ReactNode | ReactNode[];
}
declare const Error$1: (props: Omit<IError, "type">) => ReactNode;

type IFailure = SpecifixJSX<"Failure", {
    title?: string;
}, ReactNode | ReactNode[]>;
declare const Failure: (props: Omit<IFailure, "type">) => ReactNode;

type IGroup = SpecifixJSX<"Group", {
    title: string;
}, any | any[]>;
declare const Group: (props: Omit<IGroup, "type">) => ReactNode;

type IInfo = SpecifixJSX<"Info", {
    title?: string;
}, ReactNode | ReactNode[]>;
declare const Info: (props: Omit<IInfo, "type">) => ReactNode;

declare const Link: ({ url, children }: {
    children: string;
    url: string;
}) => React.ReactNode;

type IList = SpecifixJSX<"List", null, AnyElement[] | AnyElement | null>;
type IListItem = SpecifixJSX<"ListItem", null, AnyElement>;
declare const List: (props: Omit<IList, "type">) => ReactNode;
declare const ListItem: (props: Omit<IListItem, "type">) => ReactNode;

type ILog = SpecifixJSX<"Log", null, any>;
declare const Log: (props: Omit<ILog, "type">) => ReactNode;

type Color$1 = Parameters<typeof Box>[0]["borderColor"];
type Width = Parameters<typeof Box>[0]["width"];
type IRow = SpecifixJSX<"Row", {
    color?: Color$1;
    width?: (Width | undefined)[] | undefined;
    display?: "ansi" | "markdown";
}, ReactNode | ReactNode[] | undefined>;
declare const Row: (props: Omit<IRow, "type">) => ReactNode;

type Color = Parameters<typeof Container>[0]["color"];
type ISubtitle = SpecifixJSX<"Subtitle", {
    emoji?: string;
    color?: Color;
    display?: "ansi" | "markdown" | undefined;
}, string>;
declare const Subtitle: (props: Omit<ISubtitle, "type">) => ReactNode;

type ISuccess = SpecifixJSX<"Success", {
    title?: string;
}, ReactNode | ReactNode[]>;
declare const Success: (props: Omit<ISuccess, "type">) => ReactNode;

type ITimestamp = {
    type: "Timestamp";
    time?: Date | string | number;
    format?: "ISO" | "American" | "European" | string;
};
declare const Timestamp: (props: Omit<ITimestamp, "type">) => ReactNode;

type ITitle = SpecifixJSX<"Title", null, string>;
declare const Title: (props: Omit<ITitle, "type">) => ReactNode;

type Scalar = string | number | boolean | null | undefined;
type ScalarDict = {
    [key: string]: Scalar;
};
type CellProps = React.PropsWithChildren<{
    column: number;
}>;
type TableProps<T extends ScalarDict> = {
    data: T[];
    columns: (keyof T)[];
    padding: number;
    header: (props: React.PropsWithChildren<{}>) => JSX.Element;
    cell: (props: CellProps) => JSX.Element;
    skeleton: (props: React.PropsWithChildren<{}>) => JSX.Element;
};
declare class Table<T extends ScalarDict> extends React.Component<Pick<TableProps<T>, "data"> & Partial<TableProps<T>>> {
    getConfig(): TableProps<T>;
    getDataKeys(): (keyof T)[];
    getColumns(): Column<T>[];
    getHeadings(): Partial<T>;
    header: (props: RowProps<T>) => JSX.Element;
    heading: (props: RowProps<T>) => JSX.Element;
    separator: (props: RowProps<T>) => JSX.Element;
    data: (props: RowProps<T>) => JSX.Element;
    footer: (props: RowProps<T>) => JSX.Element;
    render(): JSX.Element;
}
type RowProps<T extends ScalarDict> = {
    key: string;
    data: Partial<T>;
    columns: Column<T>[];
};
type Column<T> = {
    key: string;
    column: keyof T;
    width: number;
};

declare class DOMError extends Error {
    #private;
    constructor(pipeComponent: ReactElement);
    get: () => ReactElement;
    toString: () => Promise<string>;
}

declare const maskValue = "****";
declare const maskString: (value: string | number) => string;
declare const setMask: (value: (string | number) | (string | number)[]) => void;

declare const dom_Badge: typeof Badge;
declare const dom_Container: typeof Container;
type dom_DOMError = DOMError;
declare const dom_DOMError: typeof DOMError;
declare const dom_Dialog: typeof Dialog;
declare const dom_Divider: typeof Divider;
declare const dom_Failure: typeof Failure;
declare const dom_Group: typeof Group;
declare const dom_Info: typeof Info;
declare const dom_Link: typeof Link;
declare const dom_List: typeof List;
declare const dom_ListItem: typeof ListItem;
declare const dom_Log: typeof Log;
declare const dom_Row: typeof Row;
declare const dom_Subtitle: typeof Subtitle;
declare const dom_Success: typeof Success;
type dom_Table<T extends ScalarDict> = Table<T>;
declare const dom_Table: typeof Table;
declare const dom_Text: typeof Text;
declare const dom_Timestamp: typeof Timestamp;
declare const dom_Title: typeof Title;
declare const dom_haltAllRender: typeof haltAllRender;
declare const dom_maskString: typeof maskString;
declare const dom_maskValue: typeof maskValue;
declare const dom_render: typeof render;
declare const dom_setMask: typeof setMask;
declare namespace dom {
  export { dom_Badge as Badge, dom_Container as Container, dom_DOMError as DOMError, dom_Dialog as Dialog, dom_Divider as Divider, Error$1 as Error, dom_Failure as Failure, dom_Group as Group, dom_Info as Info, dom_Link as Link, dom_List as List, dom_ListItem as ListItem, dom_Log as Log, dom_Row as Row, dom_Subtitle as Subtitle, dom_Success as Success, dom_Table as Table, dom_Text as Text, dom_Timestamp as Timestamp, dom_Title as Title, dom_haltAllRender as haltAllRender, dom_maskString as maskString, dom_maskValue as maskValue, dom_render as render, dom_setMask as setMask };
}

declare const findPnpRoot: (path: string) => string;

declare function onCleanup(callback: () => void): (call?: boolean) => void;

declare const getNvmVersion: (root?: string) => string;

type FileType = "TEST_FILES" | "MAIN_FILES" | "ALL";
declare const listFilteredFiles: (dir: string, type?: FileType) => Promise<string[]>;

interface Output {
    stdout: string;
    stderr: string;
    code: number;
}
declare class Shell {
    static execute(cmd: string, args: string[], options: {
        cwd?: string | undefined;
        env?: Record<string, string | undefined>;
    }): Promise<Output>;
}

type removeContextCommand<T extends any> = T extends infer X & PipesContextCommandBase ? X : T;

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
    run: (value: any, state: any) => Promise<any> | any;
    client: Client | null | undefined;
}
declare const createPipe: (fn: ({ z, createPipesCore }: CreatePipeProps) => Promise<PipeBase[]> | PipeBase[]) => Promise<void>;

export { type AnyModule, type AnyZodObject, type AnyZodTuple, type ArrayCardinality, type ArrayKeys, type AssertArray, type AsyncParseReturnType, BRAND, type CatchallInput, type CatchallOutput, ConfigHasModule, ContextHasModule, type CustomErrorParams, DIRTY, type DefaultProps, type DenormalizedError, EMPTY_PATH, type Effect, type EnumLike, type EnumValues, type ErrorMapCtx, type FileType, type FilterEnum, INVALID, type IPipesCoreConfig, type IPipesCoreContext, type Indices, type InnerTypeOfFunction, type InputTypeOfTuple, type InputTypeOfTupleWithRest, type InternalState, type InternalStateStore, type IpVersion, type IssueData, type KeySchema, type LoaderState, type LoaderStateStore, type ModuleReturnType, NEVER, OK, type ObjectPair, type OuterTypeOfFunction, type OutputTypeOfTuple, type OutputTypeOfTupleWithRest, type ParseContext, type ParseInput, type ParseParams, type ParsePath, type ParsePathComponent, type ParseResult, type ParseReturnType, ParseStatus, type PassthroughType, PipesCore, PipesCoreClass, PipesCoreConfig, PipesCoreContext, type PipesCoreModule, PipesCoreRunner, dom as PipesDOM, PipesError, type PreprocessEffect, type Primitive, type ProcessedCreateParams, type RawCreateParams, type RecordType, type Refinement, type RefinementCtx, type RefinementEffect, type SafeParseError, type SafeParseReturnType, type SafeParseSuccess, type Scalars, ZodType as Schema, Shell, type Simplify, type SomeZodObject, type StringValidation, type SuperRefinement, type SyncParseReturnType, type TaskSet, type TransformEffect, type TypeOf, type UnknownKeysParam, type Values, type Writeable, ZodAny, type ZodAnyDef, ZodArray, type ZodArrayDef, ZodBigInt, type ZodBigIntCheck, type ZodBigIntDef, ZodBoolean, type ZodBooleanDef, ZodBranded, type ZodBrandedDef, ZodCatch, type ZodCatchDef, type ZodCustomIssue, ZodDate, type ZodDateCheck, type ZodDateDef, ZodDefault, type ZodDefaultDef, ZodDiscriminatedUnion, type ZodDiscriminatedUnionDef, type ZodDiscriminatedUnionOption, ZodEffects, type ZodEffectsDef, ZodEnum, type ZodEnumDef, ZodError, type ZodErrorMap, type ZodFirstPartySchemaTypes, ZodFirstPartyTypeKind, type ZodFormattedError, ZodFunction, type ZodFunctionDef, ZodIntersection, type ZodIntersectionDef, type ZodInvalidArgumentsIssue, type ZodInvalidDateIssue, type ZodInvalidEnumValueIssue, type ZodInvalidIntersectionTypesIssue, type ZodInvalidLiteralIssue, type ZodInvalidReturnTypeIssue, type ZodInvalidStringIssue, type ZodInvalidTypeIssue, type ZodInvalidUnionDiscriminatorIssue, type ZodInvalidUnionIssue, type ZodIssue, type ZodIssueBase, ZodIssueCode, type ZodIssueOptionalMessage, ZodLazy, type ZodLazyDef, ZodLiteral, type ZodLiteralDef, ZodMap, type ZodMapDef, ZodNaN, type ZodNaNDef, ZodNativeEnum, type ZodNativeEnumDef, ZodNever, type ZodNeverDef, type ZodNonEmptyArray, type ZodNotFiniteIssue, type ZodNotMultipleOfIssue, ZodNull, type ZodNullDef, ZodNullable, type ZodNullableDef, type ZodNullableType, ZodNumber, type ZodNumberCheck, type ZodNumberDef, ZodObject, type ZodObjectDef, ZodOptional, type ZodOptionalDef, type ZodOptionalType, ZodParsedType, ZodPipeline, type ZodPipelineDef, ZodPromise, type ZodPromiseDef, type ZodRawShape, ZodReadonly, type ZodReadonlyDef, ZodRecord, type ZodRecordDef, ZodType as ZodSchema, ZodSet, type ZodSetDef, ZodString, type ZodStringCheck, type ZodStringDef, ZodSymbol, type ZodSymbolDef, type ZodTooBigIssue, type ZodTooSmallIssue, ZodEffects as ZodTransformer, ZodTuple, type ZodTupleDef, type ZodTupleItems, ZodType, type ZodTypeAny, type ZodTypeDef, ZodUndefined, type ZodUndefinedDef, ZodUnion, type ZodUnionDef, type ZodUnionOptions, ZodUnknown, type ZodUnknownDef, type ZodUnrecognizedKeysIssue, ZodVoid, type ZodVoidDef, _createModule, addIssueToContext, anyType as any, arrayType as array, type arrayOutputType, type baseObjectInputType, type baseObjectOutputType, bigIntType as bigint, booleanType as boolean, coerce, createConfig, createContext, createGlobalZodKeyStore, createGlobalZodStore, createInternalState, createModule, type createModuleDef, createModuleName, createPipe, createPipesCore, createState, createTask, createZodKeyStore, createZodStore, custom, dateType as date, errorMap as defaultErrorMap, type deoptional, discriminatedUnionType as discriminatedUnion, effectsType as effect, enumType as enum, findPnpRoot, functionType as function, getErrorMap, getNvmVersion, getParsedType, type TypeOf as infer, type inferFlattenedErrors, type inferFormattedError, type input, instanceOfType as instanceof, internalStateSchema, internalStateStoreSchema, intersectionType as intersection, isAborted, isAsync, isDirty, isValid, late, lazyType as lazy, listFilteredFiles, literalType as literal, loaderStateSchema, makeIssue, mapType as map, type mergeTypes, nanType as nan, nativeEnumType as nativeEnum, neverType as never, type noUnrecognized, nullType as null, nullableType as nullable, numberType as number, objectType as object, type objectInputType, type objectOutputType, objectUtil, oboolean, onCleanup, onumber, optionalType as optional, ostring, type output, pipelineType as pipeline, preprocessType as preprocess, promiseType as promise, quotelessJson, recordType as record, type removeContextCommand, setType as set, setErrorMap, stateStoreSchema, strictObjectType as strictObject, stringType as string, symbolType as symbol, taskSchema, timeFunction, effectsType as transformer, tupleType as tuple, type typeToFlattenedError, type typecast, undefinedType as undefined, unionType as union, unknownType as unknown, util, type valueToConfig, type valueToZod, voidType as void, z };
