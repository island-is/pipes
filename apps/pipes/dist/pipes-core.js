import { Container as Container$1, Client, connect } from '@dagger.io/dagger';
export * from '@dagger.io/dagger';
import isDocker from 'is-docker';
import isPodman from 'is-podman';
import { autorun, createAtom, observable, runInAction, when, reaction } from 'mobx';
import React, { forwardRef, PureComponent, Fragment } from 'react';
import ciinfo from 'ci-info';
import { parseArgs } from 'node:util';
import process$1, { cwd } from 'node:process';
import autoBind from 'auto-bind';
import throttle from 'lodash/throttle.js';
import Yoga from 'yoga-wasm-web/auto';
import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import { existsSync, readFileSync } from 'node:fs';
import codeExcerpt from 'code-excerpt';
import StackUtils from 'stack-utils';
import chalk from 'chalk';
import widestLine from 'widest-line';
import cliTruncate from 'cli-truncate';
import wrapAnsi from 'wrap-ansi';
import createReconciler from 'react-reconciler';
import { styledCharsFromTokens, tokenize, styledCharsToString } from '@alcalzone/ansi-tokenize';
import sliceAnsi from 'slice-ansi';
import stringWidth from 'string-width';
import indentString from 'indent-string';
import cliBoxes from 'cli-boxes';
import terminalLink from 'terminal-link';
import formatDate from 'date-fns/format/index.js';
import enGB from 'date-fns/locale/en-GB/index.js';
import enUS from 'date-fns/locale/en-US/index.js';
import { sha1 } from 'object-hash';
import { Writable } from 'node:stream';
import { join } from 'node:path';
import { readdir } from 'node:fs/promises';
import { spawn } from 'child_process';

var util;
(function(util) {
    util.assertEqual = (val)=>val;
    function assertIs(_arg) {}
    util.assertIs = assertIs;
    function assertNever(_x) {
        throw new Error();
    }
    util.assertNever = assertNever;
    util.arrayToEnum = (items)=>{
        const obj = {};
        for (const item of items){
            obj[item] = item;
        }
        return obj;
    };
    util.getValidEnumValues = (obj)=>{
        const validKeys = objectKeys(obj).filter((k)=>typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys){
            filtered[k] = obj[k];
        }
        return objectValues(filtered);
    };
    var objectValues = util.objectValues = (obj)=>{
        return objectKeys(obj).map(function(e) {
            return obj[e];
        });
    };
    var objectKeys = util.objectKeys = typeof Object.keys === "function" // eslint-disable-line ban/ban
     ? (obj)=>Object.keys(obj) // eslint-disable-line ban/ban
     : (object)=>{
        const keys = [];
        for(const key in object){
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                keys.push(key);
            }
        }
        return keys;
    };
    util.find = (arr, checker)=>{
        for (const item of arr){
            if (checker(item)) return item;
        }
        return undefined;
    };
    util.isInteger = typeof Number.isInteger === "function" ? (val)=>Number.isInteger(val) // eslint-disable-line ban/ban
     : (val)=>typeof val === "number" && isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
        return array.map((val)=>typeof val === "string" ? `'${val}'` : val).join(separator);
    }
    util.joinValues = joinValues;
    util.jsonStringifyReplacer = (_, value)=>{
        if (typeof value === "bigint") {
            return value.toString();
        }
        return value;
    };
})(util || (util = {}));
var objectUtil;
(function(objectUtil) {
    objectUtil.mergeShapes = (first, second)=>{
        return {
            ...first,
            ...second
        };
    };
})(objectUtil || (objectUtil = {}));
const ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set"
]);
const getParsedType = (data)=>{
    const t = typeof data;
    switch(t){
        case "undefined":
            return ZodParsedType.undefined;
        case "string":
            return ZodParsedType.string;
        case "number":
            return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
            return ZodParsedType.boolean;
        case "function":
            return ZodParsedType.function;
        case "bigint":
            return ZodParsedType.bigint;
        case "symbol":
            return ZodParsedType.symbol;
        case "object":
            if (Array.isArray(data)) {
                return ZodParsedType.array;
            }
            if (data === null) {
                return ZodParsedType.null;
            }
            if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
                return ZodParsedType.promise;
            }
            if (typeof Map !== "undefined" && data instanceof Map) {
                return ZodParsedType.map;
            }
            if (typeof Set !== "undefined" && data instanceof Set) {
                return ZodParsedType.set;
            }
            if (typeof Date !== "undefined" && data instanceof Date) {
                return ZodParsedType.date;
            }
            return ZodParsedType.object;
        default:
            return ZodParsedType.unknown;
    }
};

const ZodIssueCode = util.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite"
]);
const quotelessJson = (obj)=>{
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
};
class ZodError extends Error {
    issues = [];
    get errors() {
        return this.issues;
    }
    constructor(issues){
        super();
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            // eslint-disable-next-line ban/ban
            Object.setPrototypeOf(this, actualProto);
        } else {
            this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
    }
    format(_mapper) {
        const mapper = _mapper || function(issue) {
            return issue.message;
        };
        const fieldErrors = {
            _errors: []
        };
        const processError = (error)=>{
            for (const issue of error.issues){
                if (issue.code === "invalid_union") {
                    issue.unionErrors.map(processError);
                } else if (issue.code === "invalid_return_type") {
                    processError(issue.returnTypeError);
                } else if (issue.code === "invalid_arguments") {
                    processError(issue.argumentsError);
                } else if (issue.path.length === 0) {
                    fieldErrors._errors.push(mapper(issue));
                } else {
                    let curr = fieldErrors;
                    let i = 0;
                    while(i < issue.path.length){
                        const el = issue.path[i];
                        const terminal = i === issue.path.length - 1;
                        if (!terminal) {
                            curr[el] = curr[el] || {
                                _errors: []
                            };
                        // if (typeof el === "string") {
                        //   curr[el] = curr[el] || { _errors: [] };
                        // } else if (typeof el === "number") {
                        //   const errorArray: any = [];
                        //   errorArray._errors = [];
                        //   curr[el] = curr[el] || errorArray;
                        // }
                        } else {
                            curr[el] = curr[el] || {
                                _errors: []
                            };
                            curr[el]._errors.push(mapper(issue));
                        }
                        curr = curr[el];
                        i++;
                    }
                }
            }
        };
        processError(this);
        return fieldErrors;
    }
    static create = (issues)=>{
        const error = new ZodError(issues);
        return error;
    };
    toString() {
        return this.message;
    }
    get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
        return this.issues.length === 0;
    }
    addIssue = (sub)=>{
        this.issues = [
            ...this.issues,
            sub
        ];
    };
    addIssues = (subs = [])=>{
        this.issues = [
            ...this.issues,
            ...subs
        ];
    };
    flatten(mapper = (issue)=>issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues){
            if (sub.path.length > 0) {
                fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                fieldErrors[sub.path[0]].push(mapper(sub));
            } else {
                formErrors.push(mapper(sub));
            }
        }
        return {
            formErrors,
            fieldErrors
        };
    }
    get formErrors() {
        return this.flatten();
    }
}

const errorMap = (issue, _ctx)=>{
    let message;
    switch(issue.code){
        case ZodIssueCode.invalid_type:
            if (issue.received === ZodParsedType.undefined) {
                message = "Required";
            } else {
                message = `Expected ${issue.expected}, received ${issue.received}`;
            }
            break;
        case ZodIssueCode.invalid_literal:
            message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
            break;
        case ZodIssueCode.unrecognized_keys:
            message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
            break;
        case ZodIssueCode.invalid_union:
            message = `Invalid input`;
            break;
        case ZodIssueCode.invalid_union_discriminator:
            message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
            break;
        case ZodIssueCode.invalid_enum_value:
            message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
            break;
        case ZodIssueCode.invalid_arguments:
            message = `Invalid function arguments`;
            break;
        case ZodIssueCode.invalid_return_type:
            message = `Invalid function return type`;
            break;
        case ZodIssueCode.invalid_date:
            message = `Invalid date`;
            break;
        case ZodIssueCode.invalid_string:
            if (typeof issue.validation === "object") {
                if ("includes" in issue.validation) {
                    message = `Invalid input: must include "${issue.validation.includes}"`;
                    if (typeof issue.validation.position === "number") {
                        message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
                    }
                } else if ("startsWith" in issue.validation) {
                    message = `Invalid input: must start with "${issue.validation.startsWith}"`;
                } else if ("endsWith" in issue.validation) {
                    message = `Invalid input: must end with "${issue.validation.endsWith}"`;
                } else {
                    util.assertNever(issue.validation);
                }
            } else if (issue.validation !== "regex") {
                message = `Invalid ${issue.validation}`;
            } else {
                message = "Invalid";
            }
            break;
        case ZodIssueCode.too_small:
            if (issue.type === "array") message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
            else if (issue.type === "string") message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
            else if (issue.type === "number") message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
            else if (issue.type === "date") message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
            else message = "Invalid input";
            break;
        case ZodIssueCode.too_big:
            if (issue.type === "array") message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
            else if (issue.type === "string") message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
            else if (issue.type === "number") message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
            else if (issue.type === "bigint") message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
            else if (issue.type === "date") message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
            else message = "Invalid input";
            break;
        case ZodIssueCode.custom:
            message = `Invalid input`;
            break;
        case ZodIssueCode.invalid_intersection_types:
            message = `Intersection results could not be merged`;
            break;
        case ZodIssueCode.not_multiple_of:
            message = `Number must be a multiple of ${issue.multipleOf}`;
            break;
        case ZodIssueCode.not_finite:
            message = "Number must be finite";
            break;
        default:
            message = _ctx.defaultError;
            util.assertNever(issue);
    }
    return {
        message
    };
};

let overrideErrorMap = errorMap;
function setErrorMap(map) {
    overrideErrorMap = map;
}
function getErrorMap() {
    return overrideErrorMap;
}

const makeIssue = (params)=>{
    const { data, path, errorMaps, issueData } = params;
    const fullPath = [
        ...path,
        ...issueData.path || []
    ];
    const fullIssue = {
        ...issueData,
        path: fullPath
    };
    let errorMessage = "";
    const maps = errorMaps.filter((m)=>!!m).slice().reverse();
    for (const map of maps){
        errorMessage = map(fullIssue, {
            data,
            defaultError: errorMessage
        }).message;
    }
    return {
        ...issueData,
        path: fullPath,
        message: issueData.message || errorMessage
    };
};
const EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
    const issue = makeIssue({
        issueData: issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
            ctx.common.contextualErrorMap,
            ctx.schemaErrorMap,
            getErrorMap(),
            errorMap
        ].filter((x)=>!!x)
    });
    ctx.common.issues.push(issue);
}
class ParseStatus {
    value = "valid";
    dirty() {
        if (this.value === "valid") this.value = "dirty";
    }
    abort() {
        if (this.value !== "aborted") this.value = "aborted";
    }
    static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results){
            if (s.status === "aborted") return INVALID;
            if (s.status === "dirty") status.dirty();
            arrayValue.push(s.value);
        }
        return {
            status: status.value,
            value: arrayValue
        };
    }
    static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs){
            syncPairs.push({
                key: await pair.key,
                value: await pair.value
            });
        }
        return ParseStatus.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs){
            const { key, value } = pair;
            if (key.status === "aborted") return INVALID;
            if (value.status === "aborted") return INVALID;
            if (key.status === "dirty") status.dirty();
            if (value.status === "dirty") status.dirty();
            if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
                finalObject[key.value] = value.value;
            }
        }
        return {
            status: status.value,
            value: finalObject
        };
    }
}
const INVALID = Object.freeze({
    status: "aborted"
});
const DIRTY = (value)=>({
        status: "dirty",
        value
    });
const OK = (value)=>({
        status: "valid",
        value
    });
const isAborted = (x)=>x.status === "aborted";
const isDirty = (x)=>x.status === "dirty";
const isValid = (x)=>x.status === "valid";
const isAsync = (x)=>typeof Promise !== "undefined" && x instanceof Promise;

var errorUtil;
(function(errorUtil) {
    errorUtil.errToObj = (message)=>typeof message === "string" ? {
            message
        } : message || {};
    errorUtil.toString = (message)=>typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

class ParseInputLazyPath {
    parent;
    data;
    _path;
    _key;
    _cachedPath = [];
    constructor(parent, value, path, key){
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
    }
    get path() {
        if (!this._cachedPath.length) {
            if (this._key instanceof Array) {
                this._cachedPath.push(...this._path, ...this._key);
            } else {
                this._cachedPath.push(...this._path, this._key);
            }
        }
        return this._cachedPath;
    }
}
const handleResult = (ctx, result)=>{
    if (isValid(result)) {
        return {
            success: true,
            data: result.value
        };
    } else {
        if (!ctx.common.issues.length) {
            throw new Error("Validation failed but no issues detected.");
        }
        return {
            success: false,
            get error () {
                if (this._error) return this._error;
                const error = new ZodError(ctx.common.issues);
                this._error = error;
                return this._error;
            }
        };
    }
};
function processCreateParams(params) {
    if (!params) return {};
    const { errorMap, invalid_type_error, required_error, description } = params;
    if (errorMap && (invalid_type_error || required_error)) {
        throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap) return {
        errorMap: errorMap,
        description
    };
    const customMap = (iss, ctx)=>{
        if (iss.code !== "invalid_type") return {
            message: ctx.defaultError
        };
        if (typeof ctx.data === "undefined") {
            return {
                message: required_error ?? ctx.defaultError
            };
        }
        return {
            message: invalid_type_error ?? ctx.defaultError
        };
    };
    return {
        errorMap: customMap,
        description
    };
}
class ZodType {
    _type;
    _output;
    _input;
    _def;
    get description() {
        return this._def.description;
    }
    _getType(input) {
        return getParsedType(input.data);
    }
    _getOrReturnCtx(input, ctx) {
        return ctx || {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
        };
    }
    _processInputParams(input) {
        return {
            status: new ParseStatus(),
            ctx: {
                common: input.parent.common,
                data: input.data,
                parsedType: getParsedType(input.data),
                schemaErrorMap: this._def.errorMap,
                path: input.path,
                parent: input.parent
            }
        };
    }
    _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
            throw new Error("Synchronous parse encountered promise.");
        }
        return result;
    }
    _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
    }
    parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success) return result.data;
        throw result.error;
    }
    safeParse(data, params) {
        const ctx = {
            common: {
                issues: [],
                async: params?.async ?? false,
                contextualErrorMap: params?.errorMap
            },
            path: params?.path || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: getParsedType(data)
        };
        const result = this._parseSync({
            data,
            path: ctx.path,
            parent: ctx
        });
        return handleResult(ctx, result);
    }
    async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success) return result.data;
        throw result.error;
    }
    async safeParseAsync(data, params) {
        const ctx = {
            common: {
                issues: [],
                contextualErrorMap: params?.errorMap,
                async: true
            },
            path: params?.path || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: getParsedType(data)
        };
        const maybeAsyncResult = this._parse({
            data,
            path: ctx.path,
            parent: ctx
        });
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
    }
    /** Alias of safeParseAsync */ spa = this.safeParseAsync;
    refine(check, message) {
        const getIssueProperties = (val)=>{
            if (typeof message === "string" || typeof message === "undefined") {
                return {
                    message
                };
            } else if (typeof message === "function") {
                return message(val);
            } else {
                return message;
            }
        };
        return this._refinement((val, ctx)=>{
            const result = check(val);
            const setError = ()=>ctx.addIssue({
                    code: ZodIssueCode.custom,
                    ...getIssueProperties(val)
                });
            if (typeof Promise !== "undefined" && result instanceof Promise) {
                return result.then((data)=>{
                    if (!data) {
                        setError();
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            if (!result) {
                setError();
                return false;
            } else {
                return true;
            }
        });
    }
    refinement(check, refinementData) {
        return this._refinement((val, ctx)=>{
            if (!check(val)) {
                ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
                return false;
            } else {
                return true;
            }
        });
    }
    _refinement(refinement) {
        return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: {
                type: "refinement",
                refinement
            }
        });
    }
    superRefine(refinement) {
        return this._refinement(refinement);
    }
    constructor(def){
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
    }
    optional() {
        return ZodOptional.create(this, this._def);
    }
    nullable() {
        return ZodNullable.create(this, this._def);
    }
    nullish() {
        return this.nullable().optional();
    }
    array() {
        return ZodArray.create(this, this._def);
    }
    promise() {
        return ZodPromise.create(this, this._def);
    }
    or(option) {
        return ZodUnion.create([
            this,
            option
        ], this._def);
    }
    and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
    }
    transform(transform) {
        return new ZodEffects({
            ...processCreateParams(this._def),
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: {
                type: "transform",
                transform
            }
        });
    }
    default(def, options) {
        const defaultValueFunc = typeof def === "function" ? def : ()=>def;
        return new ZodDefault({
            ...processCreateParams(this._def),
            innerType: this,
            defaultValue: defaultValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodDefault
        });
    }
    brand() {
        return new ZodBranded({
            typeName: ZodFirstPartyTypeKind.ZodBranded,
            type: this,
            ...processCreateParams(this._def)
        });
    }
    catch(def) {
        const catchValueFunc = typeof def === "function" ? def : ()=>def;
        return new ZodCatch({
            ...processCreateParams(this._def),
            innerType: this,
            catchValue: catchValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodCatch
        });
    }
    describe(description) {
        const This = this.constructor;
        return new This({
            ...this._def,
            description
        });
    }
    pipe(target) {
        return ZodPipeline.create(this, target);
    }
    readonly() {
        return ZodReadonly.create(this);
    }
    isOptional() {
        return this.safeParse(undefined).success;
    }
    isNullable() {
        return this.safeParse(null).success;
    }
}
const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[a-z][a-z0-9]*$/;
const ulidRegex = /[0-9A-HJKMNP-TV-Z]{26}/;
// const uuidRegex =
//   /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
// from https://stackoverflow.com/a/46181/1550155
// old version: too slow, didn't support unicode
// const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
//old email regex
// const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((?!-)([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{1,})[^-<>()[\].,;:\s@"]$/i;
// eslint-disable-next-line
// const emailRegex =
//   /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/;
// const emailRegex =
//   /^[a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// const emailRegex =
//   /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
const emailRegex = /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
// const emailRegex =
//   /^[a-z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9\-]+)*$/i;
// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/u;
const ipv4Regex = /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;
const ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
// Adapted from https://stackoverflow.com/a/3143231
const datetimeRegex = (args)=>{
    if (args.precision) {
        if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        } else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`);
        }
    } else if (args.precision === 0) {
        if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        } else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
        }
    } else {
        if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        } else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`);
        }
    }
};
function isValidIP(ip, version) {
    if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
        return true;
    }
    if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
        return true;
    }
    return false;
}
class ZodString extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.string,
                received: ctx.parsedType
            });
            return INVALID;
        }
        const status = new ParseStatus();
        let ctx = undefined;
        for (const check of this._def.checks){
            if (check.kind === "min") {
                if (input.data.length < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "max") {
                if (input.data.length > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "length") {
                const tooBig = input.data.length > check.value;
                const tooSmall = input.data.length < check.value;
                if (tooBig || tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    if (tooBig) {
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_big,
                            maximum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message
                        });
                    } else if (tooSmall) {
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_small,
                            minimum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message
                        });
                    }
                    status.dirty();
                }
            } else if (check.kind === "email") {
                if (!emailRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "email",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "emoji") {
                if (!emojiRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "emoji",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "uuid") {
                if (!uuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "uuid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "cuid") {
                if (!cuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "cuid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "cuid2") {
                if (!cuid2Regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "cuid2",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "ulid") {
                if (!ulidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "ulid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "url") {
                try {
                    new URL(input.data);
                } catch  {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "url",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "regex") {
                check.regex.lastIndex = 0;
                const testResult = check.regex.test(input.data);
                if (!testResult) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "regex",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "trim") {
                input.data = input.data.trim();
            } else if (check.kind === "includes") {
                if (!input.data.includes(check.value, check.position)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: {
                            includes: check.value,
                            position: check.position
                        },
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "toLowerCase") {
                input.data = input.data.toLowerCase();
            } else if (check.kind === "toUpperCase") {
                input.data = input.data.toUpperCase();
            } else if (check.kind === "startsWith") {
                if (!input.data.startsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: {
                            startsWith: check.value
                        },
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "endsWith") {
                if (!input.data.endsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: {
                            endsWith: check.value
                        },
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "datetime") {
                const regex = datetimeRegex(check);
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: "datetime",
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "ip") {
                if (!isValidIP(input.data, check.version)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "ip",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else {
                util.assertNever(check);
            }
        }
        return {
            status: status.value,
            value: input.data
        };
    }
    _regex = (regex, validation, message)=>this.refinement((data)=>regex.test(data), {
            validation,
            code: ZodIssueCode.invalid_string,
            ...errorUtil.errToObj(message)
        });
    _addCheck(check) {
        return new ZodString({
            ...this._def,
            checks: [
                ...this._def.checks,
                check
            ]
        });
    }
    email(message) {
        return this._addCheck({
            kind: "email",
            ...errorUtil.errToObj(message)
        });
    }
    url(message) {
        return this._addCheck({
            kind: "url",
            ...errorUtil.errToObj(message)
        });
    }
    emoji(message) {
        return this._addCheck({
            kind: "emoji",
            ...errorUtil.errToObj(message)
        });
    }
    uuid(message) {
        return this._addCheck({
            kind: "uuid",
            ...errorUtil.errToObj(message)
        });
    }
    cuid(message) {
        return this._addCheck({
            kind: "cuid",
            ...errorUtil.errToObj(message)
        });
    }
    cuid2(message) {
        return this._addCheck({
            kind: "cuid2",
            ...errorUtil.errToObj(message)
        });
    }
    ulid(message) {
        return this._addCheck({
            kind: "ulid",
            ...errorUtil.errToObj(message)
        });
    }
    ip(options) {
        return this._addCheck({
            kind: "ip",
            ...errorUtil.errToObj(options)
        });
    }
    datetime(options) {
        if (typeof options === "string") {
            return this._addCheck({
                kind: "datetime",
                precision: null,
                offset: false,
                message: options
            });
        }
        return this._addCheck({
            kind: "datetime",
            precision: typeof options?.precision === "undefined" ? null : options?.precision,
            offset: options?.offset ?? false,
            ...errorUtil.errToObj(options?.message)
        });
    }
    regex(regex, message) {
        return this._addCheck({
            kind: "regex",
            regex: regex,
            ...errorUtil.errToObj(message)
        });
    }
    includes(value, options) {
        return this._addCheck({
            kind: "includes",
            value: value,
            position: options?.position,
            ...errorUtil.errToObj(options?.message)
        });
    }
    startsWith(value, message) {
        return this._addCheck({
            kind: "startsWith",
            value: value,
            ...errorUtil.errToObj(message)
        });
    }
    endsWith(value, message) {
        return this._addCheck({
            kind: "endsWith",
            value: value,
            ...errorUtil.errToObj(message)
        });
    }
    min(minLength, message) {
        return this._addCheck({
            kind: "min",
            value: minLength,
            ...errorUtil.errToObj(message)
        });
    }
    max(maxLength, message) {
        return this._addCheck({
            kind: "max",
            value: maxLength,
            ...errorUtil.errToObj(message)
        });
    }
    length(len, message) {
        return this._addCheck({
            kind: "length",
            value: len,
            ...errorUtil.errToObj(message)
        });
    }
    /**
     * @deprecated Use z.string().min(1) instead.
     * @see {@link ZodString.min}
     */ nonempty = (message)=>this.min(1, errorUtil.errToObj(message));
    trim = ()=>new ZodString({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind: "trim"
                }
            ]
        });
    toLowerCase = ()=>new ZodString({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind: "toLowerCase"
                }
            ]
        });
    toUpperCase = ()=>new ZodString({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind: "toUpperCase"
                }
            ]
        });
    get isDatetime() {
        return !!this._def.checks.find((ch)=>ch.kind === "datetime");
    }
    get isEmail() {
        return !!this._def.checks.find((ch)=>ch.kind === "email");
    }
    get isURL() {
        return !!this._def.checks.find((ch)=>ch.kind === "url");
    }
    get isEmoji() {
        return !!this._def.checks.find((ch)=>ch.kind === "emoji");
    }
    get isUUID() {
        return !!this._def.checks.find((ch)=>ch.kind === "uuid");
    }
    get isCUID() {
        return !!this._def.checks.find((ch)=>ch.kind === "cuid");
    }
    get isCUID2() {
        return !!this._def.checks.find((ch)=>ch.kind === "cuid2");
    }
    get isULID() {
        return !!this._def.checks.find((ch)=>ch.kind === "ulid");
    }
    get isIP() {
        return !!this._def.checks.find((ch)=>ch.kind === "ip");
    }
    get minLength() {
        let min = null;
        for (const ch of this._def.checks){
            if (ch.kind === "min") {
                if (min === null || ch.value > min) min = ch.value;
            }
        }
        return min;
    }
    get maxLength() {
        let max = null;
        for (const ch of this._def.checks){
            if (ch.kind === "max") {
                if (max === null || ch.value < max) max = ch.value;
            }
        }
        return max;
    }
    static create = (params)=>{
        return new ZodString({
            checks: [],
            typeName: ZodFirstPartyTypeKind.ZodString,
            coerce: params?.coerce ?? false,
            ...processCreateParams(params)
        });
    };
}
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
    return valInt % stepInt / Math.pow(10, decCount);
}
class ZodNumber extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.number,
                received: ctx.parsedType
            });
            return INVALID;
        }
        let ctx = undefined;
        const status = new ParseStatus();
        for (const check of this._def.checks){
            if (check.kind === "int") {
                if (!util.isInteger(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_type,
                        expected: "integer",
                        received: "float",
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "min") {
                const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "max") {
                const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "multipleOf") {
                if (floatSafeRemainder(input.data, check.value) !== 0) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "finite") {
                if (!Number.isFinite(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.not_finite,
                        message: check.message
                    });
                    status.dirty();
                }
            } else {
                util.assertNever(check);
            }
        }
        return {
            status: status.value,
            value: input.data
        };
    }
    static create = (params)=>{
        return new ZodNumber({
            checks: [],
            typeName: ZodFirstPartyTypeKind.ZodNumber,
            coerce: params?.coerce || false,
            ...processCreateParams(params)
        });
    };
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    min = this.gte;
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    max = this.lte;
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodNumber({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil.toString(message)
                }
            ]
        });
    }
    _addCheck(check) {
        return new ZodNumber({
            ...this._def,
            checks: [
                ...this._def.checks,
                check
            ]
        });
    }
    int(message) {
        return this._addCheck({
            kind: "int",
            message: errorUtil.toString(message)
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message)
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message)
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message)
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message)
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value: value,
            message: errorUtil.toString(message)
        });
    }
    step = this.multipleOf;
    finite(message) {
        return this._addCheck({
            kind: "finite",
            message: errorUtil.toString(message)
        });
    }
    safe(message) {
        return this._addCheck({
            kind: "min",
            inclusive: true,
            value: Number.MIN_SAFE_INTEGER,
            message: errorUtil.toString(message)
        })._addCheck({
            kind: "max",
            inclusive: true,
            value: Number.MAX_SAFE_INTEGER,
            message: errorUtil.toString(message)
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks){
            if (ch.kind === "min") {
                if (min === null || ch.value > min) min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks){
            if (ch.kind === "max") {
                if (max === null || ch.value < max) max = ch.value;
            }
        }
        return max;
    }
    get isInt() {
        return !!this._def.checks.find((ch)=>ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
    }
    get isFinite() {
        let max = null, min = null;
        for (const ch of this._def.checks){
            if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
                return true;
            } else if (ch.kind === "min") {
                if (min === null || ch.value > min) min = ch.value;
            } else if (ch.kind === "max") {
                if (max === null || ch.value < max) max = ch.value;
            }
        }
        return Number.isFinite(min) && Number.isFinite(max);
    }
}
class ZodBigInt extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = BigInt(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.bigint,
                received: ctx.parsedType
            });
            return INVALID;
        }
        let ctx = undefined;
        const status = new ParseStatus();
        for (const check of this._def.checks){
            if (check.kind === "min") {
                const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        type: "bigint",
                        minimum: check.value,
                        inclusive: check.inclusive,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "max") {
                const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        type: "bigint",
                        maximum: check.value,
                        inclusive: check.inclusive,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "multipleOf") {
                if (input.data % check.value !== BigInt(0)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message
                    });
                    status.dirty();
                }
            } else {
                util.assertNever(check);
            }
        }
        return {
            status: status.value,
            value: input.data
        };
    }
    static create = (params)=>{
        return new ZodBigInt({
            checks: [],
            typeName: ZodFirstPartyTypeKind.ZodBigInt,
            coerce: params?.coerce ?? false,
            ...processCreateParams(params)
        });
    };
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    min = this.gte;
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    max = this.lte;
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodBigInt({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil.toString(message)
                }
            ]
        });
    }
    _addCheck(check) {
        return new ZodBigInt({
            ...this._def,
            checks: [
                ...this._def.checks,
                check
            ]
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil.toString(message)
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil.toString(message)
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil.toString(message)
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil.toString(message)
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value,
            message: errorUtil.toString(message)
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks){
            if (ch.kind === "min") {
                if (min === null || ch.value > min) min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks){
            if (ch.kind === "max") {
                if (max === null || ch.value < max) max = ch.value;
            }
        }
        return max;
    }
}
class ZodBoolean extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.boolean,
                received: ctx.parsedType
            });
            return INVALID;
        }
        return OK(input.data);
    }
    static create = (params)=>{
        return new ZodBoolean({
            typeName: ZodFirstPartyTypeKind.ZodBoolean,
            coerce: params?.coerce || false,
            ...processCreateParams(params)
        });
    };
}
class ZodDate extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.date,
                received: ctx.parsedType
            });
            return INVALID;
        }
        if (isNaN(input.data.getTime())) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_date
            });
            return INVALID;
        }
        const status = new ParseStatus();
        let ctx = undefined;
        for (const check of this._def.checks){
            if (check.kind === "min") {
                if (input.data.getTime() < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        minimum: check.value,
                        type: "date"
                    });
                    status.dirty();
                }
            } else if (check.kind === "max") {
                if (input.data.getTime() > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        maximum: check.value,
                        type: "date"
                    });
                    status.dirty();
                }
            } else {
                util.assertNever(check);
            }
        }
        return {
            status: status.value,
            value: new Date(input.data.getTime())
        };
    }
    _addCheck(check) {
        return new ZodDate({
            ...this._def,
            checks: [
                ...this._def.checks,
                check
            ]
        });
    }
    min(minDate, message) {
        return this._addCheck({
            kind: "min",
            value: minDate.getTime(),
            message: errorUtil.toString(message)
        });
    }
    max(maxDate, message) {
        return this._addCheck({
            kind: "max",
            value: maxDate.getTime(),
            message: errorUtil.toString(message)
        });
    }
    get minDate() {
        let min = null;
        for (const ch of this._def.checks){
            if (ch.kind === "min") {
                if (min === null || ch.value > min) min = ch.value;
            }
        }
        return min != null ? new Date(min) : null;
    }
    get maxDate() {
        let max = null;
        for (const ch of this._def.checks){
            if (ch.kind === "max") {
                if (max === null || ch.value < max) max = ch.value;
            }
        }
        return max != null ? new Date(max) : null;
    }
    static create = (params)=>{
        return new ZodDate({
            checks: [],
            coerce: params?.coerce || false,
            typeName: ZodFirstPartyTypeKind.ZodDate,
            ...processCreateParams(params)
        });
    };
}
class ZodSymbol extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.symbol,
                received: ctx.parsedType
            });
            return INVALID;
        }
        return OK(input.data);
    }
    static create = (params)=>{
        return new ZodSymbol({
            typeName: ZodFirstPartyTypeKind.ZodSymbol,
            ...processCreateParams(params)
        });
    };
}
class ZodUndefined extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.undefined,
                received: ctx.parsedType
            });
            return INVALID;
        }
        return OK(input.data);
    }
    params;
    static create = (params)=>{
        return new ZodUndefined({
            typeName: ZodFirstPartyTypeKind.ZodUndefined,
            ...processCreateParams(params)
        });
    };
}
class ZodNull extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.null,
                received: ctx.parsedType
            });
            return INVALID;
        }
        return OK(input.data);
    }
    static create = (params)=>{
        return new ZodNull({
            typeName: ZodFirstPartyTypeKind.ZodNull,
            ...processCreateParams(params)
        });
    };
}
class ZodAny extends ZodType {
    // to prevent instances of other classes from extending ZodAny. this causes issues with catchall in ZodObject.
    _any = true;
    _parse(input) {
        return OK(input.data);
    }
    static create = (params)=>{
        return new ZodAny({
            typeName: ZodFirstPartyTypeKind.ZodAny,
            ...processCreateParams(params)
        });
    };
}
class ZodUnknown extends ZodType {
    // required
    _unknown = true;
    _parse(input) {
        return OK(input.data);
    }
    static create = (params)=>{
        return new ZodUnknown({
            typeName: ZodFirstPartyTypeKind.ZodUnknown,
            ...processCreateParams(params)
        });
    };
}
class ZodNever extends ZodType {
    _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.never,
            received: ctx.parsedType
        });
        return INVALID;
    }
    static create = (params)=>{
        return new ZodNever({
            typeName: ZodFirstPartyTypeKind.ZodNever,
            ...processCreateParams(params)
        });
    };
}
class ZodVoid extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.void,
                received: ctx.parsedType
            });
            return INVALID;
        }
        return OK(input.data);
    }
    static create = (params)=>{
        return new ZodVoid({
            typeName: ZodFirstPartyTypeKind.ZodVoid,
            ...processCreateParams(params)
        });
    };
}
class ZodArray extends ZodType {
    _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.array,
                received: ctx.parsedType
            });
            return INVALID;
        }
        if (def.exactLength !== null) {
            const tooBig = ctx.data.length > def.exactLength.value;
            const tooSmall = ctx.data.length < def.exactLength.value;
            if (tooBig || tooSmall) {
                addIssueToContext(ctx, {
                    code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
                    minimum: tooSmall ? def.exactLength.value : undefined,
                    maximum: tooBig ? def.exactLength.value : undefined,
                    type: "array",
                    inclusive: true,
                    exact: true,
                    message: def.exactLength.message
                });
                status.dirty();
            }
        }
        if (def.minLength !== null) {
            if (ctx.data.length < def.minLength.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_small,
                    minimum: def.minLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.minLength.message
                });
                status.dirty();
            }
        }
        if (def.maxLength !== null) {
            if (ctx.data.length > def.maxLength.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_big,
                    maximum: def.maxLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.maxLength.message
                });
                status.dirty();
            }
        }
        if (ctx.common.async) {
            return Promise.all([
                ...ctx.data
            ].map((item, i)=>{
                return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
            })).then((result)=>{
                return ParseStatus.mergeArray(status, result);
            });
        }
        const result = [
            ...ctx.data
        ].map((item, i)=>{
            return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
    }
    get element() {
        return this._def.type;
    }
    min(minLength, message) {
        return new ZodArray({
            ...this._def,
            minLength: {
                value: minLength,
                message: errorUtil.toString(message)
            }
        });
    }
    max(maxLength, message) {
        return new ZodArray({
            ...this._def,
            maxLength: {
                value: maxLength,
                message: errorUtil.toString(message)
            }
        });
    }
    length(len, message) {
        return new ZodArray({
            ...this._def,
            exactLength: {
                value: len,
                message: errorUtil.toString(message)
            }
        });
    }
    nonempty(message) {
        return this.min(1, message);
    }
    static create = (schema, params)=>{
        return new ZodArray({
            type: schema,
            minLength: null,
            maxLength: null,
            exactLength: null,
            typeName: ZodFirstPartyTypeKind.ZodArray,
            ...processCreateParams(params)
        });
    };
}
function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
        const newShape = {};
        for(const key in schema.shape){
            const fieldSchema = schema.shape[key];
            newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject({
            ...schema._def,
            shape: ()=>newShape
        });
    } else if (schema instanceof ZodArray) {
        return new ZodArray({
            ...schema._def,
            type: deepPartialify(schema.element)
        });
    } else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map((item)=>deepPartialify(item)));
    } else {
        return schema;
    }
}
class ZodObject extends ZodType {
    _cached = null;
    _getCached() {
        if (this._cached !== null) return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        return this._cached = {
            shape,
            keys
        };
    }
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType
            });
            return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
            for(const key in ctx.data){
                if (!shapeKeys.includes(key)) {
                    extraKeys.push(key);
                }
            }
        }
        const pairs = [];
        for (const key of shapeKeys){
            const keyValidator = shape[key];
            const value = ctx.data[key];
            pairs.push({
                key: {
                    status: "valid",
                    value: key
                },
                value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
                alwaysSet: key in ctx.data
            });
        }
        if (this._def.catchall instanceof ZodNever) {
            const unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
                for (const key of extraKeys){
                    pairs.push({
                        key: {
                            status: "valid",
                            value: key
                        },
                        value: {
                            status: "valid",
                            value: ctx.data[key]
                        }
                    });
                }
            } else if (unknownKeys === "strict") {
                if (extraKeys.length > 0) {
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.unrecognized_keys,
                        keys: extraKeys
                    });
                    status.dirty();
                }
            } else if (unknownKeys === "strip") ; else {
                throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
            }
        } else {
            // run catchall validation
            const catchall = this._def.catchall;
            for (const key of extraKeys){
                const value = ctx.data[key];
                pairs.push({
                    key: {
                        status: "valid",
                        value: key
                    },
                    value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key) //, ctx.child(key), value, getParsedType(value)
                    ),
                    alwaysSet: key in ctx.data
                });
            }
        }
        if (ctx.common.async) {
            return Promise.resolve().then(async ()=>{
                const syncPairs = [];
                for (const pair of pairs){
                    const key = await pair.key;
                    syncPairs.push({
                        key,
                        value: await pair.value,
                        alwaysSet: pair.alwaysSet
                    });
                }
                return syncPairs;
            }).then((syncPairs)=>{
                return ParseStatus.mergeObjectSync(status, syncPairs);
            });
        } else {
            return ParseStatus.mergeObjectSync(status, pairs);
        }
    }
    get shape() {
        return this._def.shape();
    }
    strict(message) {
        errorUtil.errToObj;
        return new ZodObject({
            ...this._def,
            unknownKeys: "strict",
            ...message !== undefined ? {
                errorMap: (issue, ctx)=>{
                    const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
                    if (issue.code === "unrecognized_keys") return {
                        message: errorUtil.errToObj(message).message ?? defaultError
                    };
                    return {
                        message: defaultError
                    };
                }
            } : {}
        });
    }
    strip() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "strip"
        });
    }
    passthrough() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "passthrough"
        });
    }
    /**
     * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
     * If you want to pass through unknown properties, use `.passthrough()` instead.
     */ nonstrict = this.passthrough;
    // const AugmentFactory =
    //   <Def extends ZodObjectDef>(def: Def) =>
    //   <Augmentation extends ZodRawShape>(
    //     augmentation: Augmentation
    //   ): ZodObject<
    //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
    //     Def["unknownKeys"],
    //     Def["catchall"]
    //   > => {
    //     return new ZodObject({
    //       ...def,
    //       shape: () => ({
    //         ...def.shape(),
    //         ...augmentation,
    //       }),
    //     }) as any;
    //   };
    extend(augmentation) {
        return new ZodObject({
            ...this._def,
            shape: ()=>({
                    ...this._def.shape(),
                    ...augmentation
                })
        });
    }
    // extend<
    //   Augmentation extends ZodRawShape,
    //   NewOutput extends util.flatten<{
    //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
    //       ? Augmentation[k]["_output"]
    //       : k extends keyof Output
    //       ? Output[k]
    //       : never;
    //   }>,
    //   NewInput extends util.flatten<{
    //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
    //       ? Augmentation[k]["_input"]
    //       : k extends keyof Input
    //       ? Input[k]
    //       : never;
    //   }>
    // >(
    //   augmentation: Augmentation
    // ): ZodObject<
    //   extendShape<T, Augmentation>,
    //   UnknownKeys,
    //   Catchall,
    //   NewOutput,
    //   NewInput
    // > {
    //   return new ZodObject({
    //     ...this._def,
    //     shape: () => ({
    //       ...this._def.shape(),
    //       ...augmentation,
    //     }),
    //   }) as any;
    // }
    /**
     * @deprecated Use `.extend` instead
     *  */ augment = this.extend;
    /**
     * Prior to zod@1.0.12 there was a bug in the
     * inferred type of merged objects. Please
     * upgrade if you are experiencing issues.
     */ merge(merging) {
        const merged = new ZodObject({
            unknownKeys: merging._def.unknownKeys,
            catchall: merging._def.catchall,
            shape: ()=>({
                    ...this._def.shape(),
                    ...merging._def.shape()
                }),
            typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
    }
    // merge<
    //   Incoming extends AnyZodObject,
    //   Augmentation extends Incoming["shape"],
    //   NewOutput extends {
    //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
    //       ? Augmentation[k]["_output"]
    //       : k extends keyof Output
    //       ? Output[k]
    //       : never;
    //   },
    //   NewInput extends {
    //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
    //       ? Augmentation[k]["_input"]
    //       : k extends keyof Input
    //       ? Input[k]
    //       : never;
    //   }
    // >(
    //   merging: Incoming
    // ): ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"],
    //   NewOutput,
    //   NewInput
    // > {
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    setKey(key, schema) {
        return this.augment({
            [key]: schema
        });
    }
    // merge<Incoming extends AnyZodObject>(
    //   merging: Incoming
    // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
    // ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"]
    // > {
    //   // const mergedShape = objectUtil.mergeShapes(
    //   //   this._def.shape(),
    //   //   merging._def.shape()
    //   // );
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    catchall(index) {
        return new ZodObject({
            ...this._def,
            catchall: index
        });
    }
    pick(mask) {
        const shape = {};
        util.objectKeys(mask).forEach((key)=>{
            if (mask[key] && this.shape[key]) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject({
            ...this._def,
            shape: ()=>shape
        });
    }
    omit(mask) {
        const shape = {};
        util.objectKeys(this.shape).forEach((key)=>{
            if (!mask[key]) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject({
            ...this._def,
            shape: ()=>shape
        });
    }
    /**
     * @deprecated
     */ deepPartial() {
        return deepPartialify(this);
    }
    partial(mask) {
        const newShape = {};
        util.objectKeys(this.shape).forEach((key)=>{
            const fieldSchema = this.shape[key];
            if (mask && !mask[key]) {
                newShape[key] = fieldSchema;
            } else {
                newShape[key] = fieldSchema.optional();
            }
        });
        return new ZodObject({
            ...this._def,
            shape: ()=>newShape
        });
    }
    required(mask) {
        const newShape = {};
        util.objectKeys(this.shape).forEach((key)=>{
            if (mask && !mask[key]) {
                newShape[key] = this.shape[key];
            } else {
                const fieldSchema = this.shape[key];
                let newField = fieldSchema;
                while(newField instanceof ZodOptional){
                    newField = newField._def.innerType;
                }
                newShape[key] = newField;
            }
        });
        return new ZodObject({
            ...this._def,
            shape: ()=>newShape
        });
    }
    keyof() {
        return createZodEnum(util.objectKeys(this.shape));
    }
    static create = (shape, params)=>{
        return new ZodObject({
            shape: ()=>shape,
            unknownKeys: "strip",
            catchall: ZodNever.create(),
            typeName: ZodFirstPartyTypeKind.ZodObject,
            ...processCreateParams(params)
        });
    };
    static strictCreate = (shape, params)=>{
        return new ZodObject({
            shape: ()=>shape,
            unknownKeys: "strict",
            catchall: ZodNever.create(),
            typeName: ZodFirstPartyTypeKind.ZodObject,
            ...processCreateParams(params)
        });
    };
    static lazycreate = (shape, params)=>{
        return new ZodObject({
            shape,
            unknownKeys: "strip",
            catchall: ZodNever.create(),
            typeName: ZodFirstPartyTypeKind.ZodObject,
            ...processCreateParams(params)
        });
    };
}
class ZodUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
            // return first issue-free validation if it exists
            for (const result of results){
                if (result.result.status === "valid") {
                    return result.result;
                }
            }
            for (const result of results){
                if (result.result.status === "dirty") {
                    // add issues from dirty option
                    ctx.common.issues.push(...result.ctx.common.issues);
                    return result.result;
                }
            }
            // return invalid
            const unionErrors = results.map((result)=>new ZodError(result.ctx.common.issues));
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_union,
                unionErrors
            });
            return INVALID;
        }
        if (ctx.common.async) {
            return Promise.all(options.map(async (option)=>{
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: []
                    },
                    parent: null
                };
                return {
                    result: await option._parseAsync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: childCtx
                    }),
                    ctx: childCtx
                };
            })).then(handleResults);
        } else {
            let dirty = undefined;
            const issues = [];
            for (const option of options){
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: []
                    },
                    parent: null
                };
                const result = option._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: childCtx
                });
                if (result.status === "valid") {
                    return result;
                } else if (result.status === "dirty" && !dirty) {
                    dirty = {
                        result,
                        ctx: childCtx
                    };
                }
                if (childCtx.common.issues.length) {
                    issues.push(childCtx.common.issues);
                }
            }
            if (dirty) {
                ctx.common.issues.push(...dirty.ctx.common.issues);
                return dirty.result;
            }
            const unionErrors = issues.map((issues)=>new ZodError(issues));
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_union,
                unionErrors
            });
            return INVALID;
        }
    }
    get options() {
        return this._def.options;
    }
    static create = (types, params)=>{
        return new ZodUnion({
            options: types,
            typeName: ZodFirstPartyTypeKind.ZodUnion,
            ...processCreateParams(params)
        });
    };
}
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////                                 //////////
//////////      ZodDiscriminatedUnion      //////////
//////////                                 //////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
const getDiscriminator = (type)=>{
    if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
    } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
    } else if (type instanceof ZodLiteral) {
        return [
            type.value
        ];
    } else if (type instanceof ZodEnum) {
        return type.options;
    } else if (type instanceof ZodNativeEnum) {
        // eslint-disable-next-line ban/ban
        return Object.keys(type.enum);
    } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
    } else if (type instanceof ZodUndefined) {
        return [
            undefined
        ];
    } else if (type instanceof ZodNull) {
        return [
            null
        ];
    } else {
        return null;
    }
};
class ZodDiscriminatedUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType
            });
            return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_union_discriminator,
                options: Array.from(this.optionsMap.keys()),
                path: [
                    discriminator
                ]
            });
            return INVALID;
        }
        if (ctx.common.async) {
            return option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
            });
        } else {
            return option._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
            });
        }
    }
    get discriminator() {
        return this._def.discriminator;
    }
    get options() {
        return this._def.options;
    }
    get optionsMap() {
        return this._def.optionsMap;
    }
    /**
     * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
     * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
     * have a different value for each object in the union.
     * @param discriminator the name of the discriminator property
     * @param types an array of object schemas
     * @param params
     */ static create(discriminator, options, params) {
        // Get all the valid discriminator values
        const optionsMap = new Map();
        // try {
        for (const type of options){
            const discriminatorValues = getDiscriminator(type.shape[discriminator]);
            if (!discriminatorValues) {
                throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
            }
            for (const value of discriminatorValues){
                if (optionsMap.has(value)) {
                    throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
                }
                optionsMap.set(value, type);
            }
        }
        return new ZodDiscriminatedUnion({
            typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
            discriminator,
            options,
            optionsMap,
            ...processCreateParams(params)
        });
    }
}
function mergeValues(a, b) {
    const aType = getParsedType(a);
    const bType = getParsedType(b);
    if (a === b) {
        return {
            valid: true,
            data: a
        };
    } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
        const bKeys = util.objectKeys(b);
        const sharedKeys = util.objectKeys(a).filter((key)=>bKeys.indexOf(key) !== -1);
        const newObj = {
            ...a,
            ...b
        };
        for (const key of sharedKeys){
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return {
                    valid: false
                };
            }
            newObj[key] = sharedValue.data;
        }
        return {
            valid: true,
            data: newObj
        };
    } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
        if (a.length !== b.length) {
            return {
                valid: false
            };
        }
        const newArray = [];
        for(let index = 0; index < a.length; index++){
            const itemA = a[index];
            const itemB = b[index];
            const sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return {
                    valid: false
                };
            }
            newArray.push(sharedValue.data);
        }
        return {
            valid: true,
            data: newArray
        };
    } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
        return {
            valid: true,
            data: a
        };
    } else {
        return {
            valid: false
        };
    }
}
class ZodIntersection extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight)=>{
            if (isAborted(parsedLeft) || isAborted(parsedRight)) {
                return INVALID;
            }
            const merged = mergeValues(parsedLeft.value, parsedRight.value);
            if (!merged.valid) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_intersection_types
                });
                return INVALID;
            }
            if (isDirty(parsedLeft) || isDirty(parsedRight)) {
                status.dirty();
            }
            return {
                status: status.value,
                value: merged.data
            };
        };
        if (ctx.common.async) {
            return Promise.all([
                this._def.left._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                }),
                this._def.right._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                })
            ]).then(([left, right])=>handleParsed(left, right));
        } else {
            return handleParsed(this._def.left._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
            }), this._def.right._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
            }));
        }
    }
    static create = (left, right, params)=>{
        return new ZodIntersection({
            left: left,
            right: right,
            typeName: ZodFirstPartyTypeKind.ZodIntersection,
            ...processCreateParams(params)
        });
    };
}
class ZodTuple extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.array,
                received: ctx.parsedType
            });
            return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array"
            });
            return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array"
            });
            status.dirty();
        }
        const items = [
            ...ctx.data
        ].map((item, itemIndex)=>{
            const schema = this._def.items[itemIndex] || this._def.rest;
            if (!schema) return null;
            return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x)=>!!x); // filter nulls
        if (ctx.common.async) {
            return Promise.all(items).then((results)=>{
                return ParseStatus.mergeArray(status, results);
            });
        } else {
            return ParseStatus.mergeArray(status, items);
        }
    }
    get items() {
        return this._def.items;
    }
    rest(rest) {
        return new ZodTuple({
            ...this._def,
            rest
        });
    }
    static create = (schemas, params)=>{
        if (!Array.isArray(schemas)) {
            throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
        }
        return new ZodTuple({
            items: schemas,
            typeName: ZodFirstPartyTypeKind.ZodTuple,
            rest: null,
            ...processCreateParams(params)
        });
    };
}
class ZodRecord extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType
            });
            return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for(const key in ctx.data){
            pairs.push({
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
                value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key))
            });
        }
        if (ctx.common.async) {
            return ParseStatus.mergeObjectAsync(status, pairs);
        } else {
            return ParseStatus.mergeObjectSync(status, pairs);
        }
    }
    get element() {
        return this._def.valueType;
    }
    static create(first, second, third) {
        if (second instanceof ZodType) {
            return new ZodRecord({
                keyType: first,
                valueType: second,
                typeName: ZodFirstPartyTypeKind.ZodRecord,
                ...processCreateParams(third)
            });
        }
        return new ZodRecord({
            keyType: ZodString.create(),
            valueType: first,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(second)
        });
    }
}
class ZodMap extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.map,
                received: ctx.parsedType
            });
            return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [
            ...ctx.data.entries()
        ].map(([key, value], index)=>{
            return {
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [
                    index,
                    "key"
                ])),
                value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [
                    index,
                    "value"
                ]))
            };
        });
        if (ctx.common.async) {
            const finalMap = new Map();
            return Promise.resolve().then(async ()=>{
                for (const pair of pairs){
                    const key = await pair.key;
                    const value = await pair.value;
                    if (key.status === "aborted" || value.status === "aborted") {
                        return INVALID;
                    }
                    if (key.status === "dirty" || value.status === "dirty") {
                        status.dirty();
                    }
                    finalMap.set(key.value, value.value);
                }
                return {
                    status: status.value,
                    value: finalMap
                };
            });
        } else {
            const finalMap = new Map();
            for (const pair of pairs){
                const key = pair.key;
                const value = pair.value;
                if (key.status === "aborted" || value.status === "aborted") {
                    return INVALID;
                }
                if (key.status === "dirty" || value.status === "dirty") {
                    status.dirty();
                }
                finalMap.set(key.value, value.value);
            }
            return {
                status: status.value,
                value: finalMap
            };
        }
    }
    static create = (keyType, valueType, params)=>{
        return new ZodMap({
            valueType,
            keyType,
            typeName: ZodFirstPartyTypeKind.ZodMap,
            ...processCreateParams(params)
        });
    };
}
class ZodSet extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.set,
                received: ctx.parsedType
            });
            return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
            if (ctx.data.size < def.minSize.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_small,
                    minimum: def.minSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.minSize.message
                });
                status.dirty();
            }
        }
        if (def.maxSize !== null) {
            if (ctx.data.size > def.maxSize.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_big,
                    maximum: def.maxSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.maxSize.message
                });
                status.dirty();
            }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements) {
            const parsedSet = new Set();
            for (const element of elements){
                if (element.status === "aborted") return INVALID;
                if (element.status === "dirty") status.dirty();
                parsedSet.add(element.value);
            }
            return {
                status: status.value,
                value: parsedSet
            };
        }
        const elements = [
            ...ctx.data.values()
        ].map((item, i)=>valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
            return Promise.all(elements).then((elements)=>finalizeSet(elements));
        } else {
            return finalizeSet(elements);
        }
    }
    min(minSize, message) {
        return new ZodSet({
            ...this._def,
            minSize: {
                value: minSize,
                message: errorUtil.toString(message)
            }
        });
    }
    max(maxSize, message) {
        return new ZodSet({
            ...this._def,
            maxSize: {
                value: maxSize,
                message: errorUtil.toString(message)
            }
        });
    }
    size(size, message) {
        return this.min(size, message).max(size, message);
    }
    nonempty(message) {
        return this.min(1, message);
    }
    static create = (valueType, params)=>{
        return new ZodSet({
            valueType,
            minSize: null,
            maxSize: null,
            typeName: ZodFirstPartyTypeKind.ZodSet,
            ...processCreateParams(params)
        });
    };
}
class ZodFunction extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.function,
                received: ctx.parsedType
            });
            return INVALID;
        }
        function makeArgsIssue(args, error) {
            return makeIssue({
                data: args,
                path: ctx.path,
                errorMaps: [
                    ctx.common.contextualErrorMap,
                    ctx.schemaErrorMap,
                    getErrorMap(),
                    errorMap
                ].filter((x)=>!!x),
                issueData: {
                    code: ZodIssueCode.invalid_arguments,
                    argumentsError: error
                }
            });
        }
        function makeReturnsIssue(returns, error) {
            return makeIssue({
                data: returns,
                path: ctx.path,
                errorMaps: [
                    ctx.common.contextualErrorMap,
                    ctx.schemaErrorMap,
                    getErrorMap(),
                    errorMap
                ].filter((x)=>!!x),
                issueData: {
                    code: ZodIssueCode.invalid_return_type,
                    returnTypeError: error
                }
            });
        }
        const params = {
            errorMap: ctx.common.contextualErrorMap
        };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
            // Would love a way to avoid disabling this rule, but we need
            // an alias (using an arrow function was what caused 2651).
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const me = this;
            return OK(async function(...args) {
                const error = new ZodError([]);
                const parsedArgs = await me._def.args.parseAsync(args, params).catch((e)=>{
                    error.addIssue(makeArgsIssue(args, e));
                    throw error;
                });
                const result = await Reflect.apply(fn, this, parsedArgs);
                const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e)=>{
                    error.addIssue(makeReturnsIssue(result, e));
                    throw error;
                });
                return parsedReturns;
            });
        } else {
            // Would love a way to avoid disabling this rule, but we need
            // an alias (using an arrow function was what caused 2651).
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const me = this;
            return OK(function(...args) {
                const parsedArgs = me._def.args.safeParse(args, params);
                if (!parsedArgs.success) {
                    throw new ZodError([
                        makeArgsIssue(args, parsedArgs.error)
                    ]);
                }
                const result = Reflect.apply(fn, this, parsedArgs.data);
                const parsedReturns = me._def.returns.safeParse(result, params);
                if (!parsedReturns.success) {
                    throw new ZodError([
                        makeReturnsIssue(result, parsedReturns.error)
                    ]);
                }
                return parsedReturns.data;
            });
        }
    }
    parameters() {
        return this._def.args;
    }
    returnType() {
        return this._def.returns;
    }
    args(...items) {
        return new ZodFunction({
            ...this._def,
            args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
    }
    returns(returnType) {
        return new ZodFunction({
            ...this._def,
            returns: returnType
        });
    }
    implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    validate = this.implement;
    static create(args, returns, params) {
        return new ZodFunction({
            args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
            returns: returns || ZodUnknown.create(),
            typeName: ZodFirstPartyTypeKind.ZodFunction,
            ...processCreateParams(params)
        });
    }
}
class ZodLazy extends ZodType {
    get schema() {
        return this._def.getter();
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
        });
    }
    static create = (getter, params)=>{
        return new ZodLazy({
            getter: getter,
            typeName: ZodFirstPartyTypeKind.ZodLazy,
            ...processCreateParams(params)
        });
    };
}
class ZodLiteral extends ZodType {
    _parse(input) {
        if (input.data !== this._def.value) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                received: ctx.data,
                code: ZodIssueCode.invalid_literal,
                expected: this._def.value
            });
            return INVALID;
        }
        return {
            status: "valid",
            value: input.data
        };
    }
    get value() {
        return this._def.value;
    }
    static create = (value, params)=>{
        return new ZodLiteral({
            value: value,
            typeName: ZodFirstPartyTypeKind.ZodLiteral,
            ...processCreateParams(params)
        });
    };
}
function createZodEnum(values, params) {
    return new ZodEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodEnum,
        ...processCreateParams(params)
    });
}
class ZodEnum extends ZodType {
    _parse(input) {
        if (typeof input.data !== "string") {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            addIssueToContext(ctx, {
                expected: util.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodIssueCode.invalid_type
            });
            return INVALID;
        }
        if (this._def.values.indexOf(input.data) === -1) {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            addIssueToContext(ctx, {
                received: ctx.data,
                code: ZodIssueCode.invalid_enum_value,
                options: expectedValues
            });
            return INVALID;
        }
        return OK(input.data);
    }
    get options() {
        return this._def.values;
    }
    get enum() {
        const enumValues = {};
        for (const val of this._def.values){
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Values() {
        const enumValues = {};
        for (const val of this._def.values){
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Enum() {
        const enumValues = {};
        for (const val of this._def.values){
            enumValues[val] = val;
        }
        return enumValues;
    }
    extract(values) {
        return ZodEnum.create(values);
    }
    exclude(values) {
        return ZodEnum.create(this.options.filter((opt)=>!values.includes(opt)));
    }
    static create = createZodEnum;
}
class ZodNativeEnum extends ZodType {
    _parse(input) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
            const expectedValues = util.objectValues(nativeEnumValues);
            addIssueToContext(ctx, {
                expected: util.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodIssueCode.invalid_type
            });
            return INVALID;
        }
        if (nativeEnumValues.indexOf(input.data) === -1) {
            const expectedValues = util.objectValues(nativeEnumValues);
            addIssueToContext(ctx, {
                received: ctx.data,
                code: ZodIssueCode.invalid_enum_value,
                options: expectedValues
            });
            return INVALID;
        }
        return OK(input.data);
    }
    get enum() {
        return this._def.values;
    }
    static create = (values, params)=>{
        return new ZodNativeEnum({
            values: values,
            typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
            ...processCreateParams(params)
        });
    };
}
class ZodPromise extends ZodType {
    unwrap() {
        return this._def.type;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.promise,
                received: ctx.parsedType
            });
            return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK(promisified.then((data)=>{
            return this._def.type.parseAsync(data, {
                path: ctx.path,
                errorMap: ctx.common.contextualErrorMap
            });
        }));
    }
    static create = (schema, params)=>{
        return new ZodPromise({
            type: schema,
            typeName: ZodFirstPartyTypeKind.ZodPromise,
            ...processCreateParams(params)
        });
    };
}
class ZodEffects extends ZodType {
    innerType() {
        return this._def.schema;
    }
    sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
            addIssue: (arg)=>{
                addIssueToContext(ctx, arg);
                if (arg.fatal) {
                    status.abort();
                } else {
                    status.dirty();
                }
            },
            get path () {
                return ctx.path;
            }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
            const processed = effect.transform(ctx.data, checkCtx);
            if (ctx.common.issues.length) {
                return {
                    status: "dirty",
                    value: ctx.data
                };
            }
            if (ctx.common.async) {
                return Promise.resolve(processed).then((processed)=>{
                    return this._def.schema._parseAsync({
                        data: processed,
                        path: ctx.path,
                        parent: ctx
                    });
                });
            } else {
                return this._def.schema._parseSync({
                    data: processed,
                    path: ctx.path,
                    parent: ctx
                });
            }
        }
        if (effect.type === "refinement") {
            const executeRefinement = (acc)=>{
                const result = effect.refinement(acc, checkCtx);
                if (ctx.common.async) {
                    return Promise.resolve(result);
                }
                if (result instanceof Promise) {
                    throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
                }
                return acc;
            };
            if (ctx.common.async === false) {
                const inner = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                });
                if (inner.status === "aborted") return INVALID;
                if (inner.status === "dirty") status.dirty();
                // return value is ignored
                executeRefinement(inner.value);
                return {
                    status: status.value,
                    value: inner.value
                };
            } else {
                return this._def.schema._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                }).then((inner)=>{
                    if (inner.status === "aborted") return INVALID;
                    if (inner.status === "dirty") status.dirty();
                    return executeRefinement(inner.value).then(()=>{
                        return {
                            status: status.value,
                            value: inner.value
                        };
                    });
                });
            }
        }
        if (effect.type === "transform") {
            if (ctx.common.async === false) {
                const base = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                });
                if (!isValid(base)) return base;
                const result = effect.transform(base.value, checkCtx);
                if (result instanceof Promise) {
                    throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
                }
                return {
                    status: status.value,
                    value: result
                };
            } else {
                return this._def.schema._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                }).then((base)=>{
                    if (!isValid(base)) return base;
                    return Promise.resolve(effect.transform(base.value, checkCtx)).then((result)=>({
                            status: status.value,
                            value: result
                        }));
                });
            }
        }
        util.assertNever(effect);
    }
    static create = (schema, effect, params)=>{
        return new ZodEffects({
            schema,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect,
            ...processCreateParams(params)
        });
    };
    static createWithPreprocess = (preprocess, schema, params)=>{
        return new ZodEffects({
            schema,
            effect: {
                type: "preprocess",
                transform: preprocess
            },
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            ...processCreateParams(params)
        });
    };
}
class ZodOptional extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
            return OK(undefined);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
    static create = (type, params)=>{
        return new ZodOptional({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodOptional,
            ...processCreateParams(params)
        });
    };
}
class ZodNullable extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
            return OK(null);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
    static create = (type, params)=>{
        return new ZodNullable({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodNullable,
            ...processCreateParams(params)
        });
    };
}
class ZodDefault extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
            data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
            data,
            path: ctx.path,
            parent: ctx
        });
    }
    removeDefault() {
        return this._def.innerType;
    }
    static create = (type, params)=>{
        return new ZodDefault({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodDefault,
            defaultValue: typeof params.default === "function" ? params.default : ()=>params.default,
            ...processCreateParams(params)
        });
    };
}
class ZodCatch extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        // newCtx is used to not collect issues from inner types in ctx
        const newCtx = {
            ...ctx,
            common: {
                ...ctx.common,
                issues: []
            }
        };
        const result = this._def.innerType._parse({
            data: newCtx.data,
            path: newCtx.path,
            parent: {
                ...newCtx
            }
        });
        if (isAsync(result)) {
            return result.then((result)=>{
                return {
                    status: "valid",
                    value: result.status === "valid" ? result.value : this._def.catchValue({
                        get error () {
                            return new ZodError(newCtx.common.issues);
                        },
                        input: newCtx.data
                    })
                };
            });
        } else {
            return {
                status: "valid",
                value: result.status === "valid" ? result.value : this._def.catchValue({
                    get error () {
                        return new ZodError(newCtx.common.issues);
                    },
                    input: newCtx.data
                })
            };
        }
    }
    removeCatch() {
        return this._def.innerType;
    }
    static create = (type, params)=>{
        return new ZodCatch({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodCatch,
            catchValue: typeof params.catch === "function" ? params.catch : ()=>params.catch,
            ...processCreateParams(params)
        });
    };
}
class ZodNaN extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.nan,
                received: ctx.parsedType
            });
            return INVALID;
        }
        return {
            status: "valid",
            value: input.data
        };
    }
    static create = (params)=>{
        return new ZodNaN({
            typeName: ZodFirstPartyTypeKind.ZodNaN,
            ...processCreateParams(params)
        });
    };
}
const BRAND = Symbol("zod_brand");
class ZodBranded extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
            data,
            path: ctx.path,
            parent: ctx
        });
    }
    unwrap() {
        return this._def.type;
    }
}
class ZodPipeline extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
            const handleAsync = async ()=>{
                const inResult = await this._def.in._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                });
                if (inResult.status === "aborted") return INVALID;
                if (inResult.status === "dirty") {
                    status.dirty();
                    return DIRTY(inResult.value);
                } else {
                    return this._def.out._parseAsync({
                        data: inResult.value,
                        path: ctx.path,
                        parent: ctx
                    });
                }
            };
            return handleAsync();
        } else {
            const inResult = this._def.in._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
            });
            if (inResult.status === "aborted") return INVALID;
            if (inResult.status === "dirty") {
                status.dirty();
                return {
                    status: "dirty",
                    value: inResult.value
                };
            } else {
                return this._def.out._parseSync({
                    data: inResult.value,
                    path: ctx.path,
                    parent: ctx
                });
            }
        }
    }
    static create(a, b) {
        return new ZodPipeline({
            in: a,
            out: b,
            typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
    }
}
class ZodReadonly extends ZodType {
    _parse(input) {
        const result = this._def.innerType._parse(input);
        if (isValid(result)) {
            result.value = Object.freeze(result.value);
        }
        return result;
    }
    static create = (type, params)=>{
        return new ZodReadonly({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodReadonly,
            ...processCreateParams(params)
        });
    };
}
const custom = (check, params = {}, /*
 * @deprecated
 *
 * Pass `fatal` into the params object instead:
 *
 * ```ts
 * z.string().custom((val) => val.length > 5, { fatal: false })
 * ```
 *
 */ fatal)=>{
    if (check) return ZodAny.create().superRefine((data, ctx)=>{
        if (!check(data)) {
            const p = typeof params === "function" ? params(data) : typeof params === "string" ? {
                message: params
            } : params;
            const _fatal = p.fatal ?? fatal ?? true;
            const p2 = typeof p === "string" ? {
                message: p
            } : p;
            ctx.addIssue({
                code: "custom",
                ...p2,
                fatal: _fatal
            });
        }
    });
    return ZodAny.create();
};
const late = {
    object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind) {
    ZodFirstPartyTypeKind["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
    ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
    ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
    ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
    ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
    ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
const instanceOfType = (// const instanceOfType = <T extends new (...args: any[]) => any>(
cls, params = {
    message: `Input not instance of ${cls.name}`
})=>custom((data)=>data instanceof cls, params);
const stringType = ZodString.create;
const numberType = ZodNumber.create;
const nanType = ZodNaN.create;
const bigIntType = ZodBigInt.create;
const booleanType = ZodBoolean.create;
const dateType = ZodDate.create;
const symbolType = ZodSymbol.create;
const undefinedType = ZodUndefined.create;
const nullType = ZodNull.create;
const anyType = ZodAny.create;
const unknownType = ZodUnknown.create;
const neverType = ZodNever.create;
const voidType = ZodVoid.create;
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const strictObjectType = ZodObject.strictCreate;
const unionType = ZodUnion.create;
const discriminatedUnionType = ZodDiscriminatedUnion.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const recordType = ZodRecord.create;
const mapType = ZodMap.create;
const setType = ZodSet.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const nativeEnumType = ZodNativeEnum.create;
const promiseType = ZodPromise.create;
const effectsType = ZodEffects.create;
const optionalType = ZodOptional.create;
const nullableType = ZodNullable.create;
const preprocessType = ZodEffects.createWithPreprocess;
const pipelineType = ZodPipeline.create;
const ostring = ()=>stringType().optional();
const onumber = ()=>numberType().optional();
const oboolean = ()=>booleanType().optional();
const coerce = {
    string: (arg)=>ZodString.create({
            ...arg,
            coerce: true
        }),
    number: (arg)=>ZodNumber.create({
            ...arg,
            coerce: true
        }),
    boolean: (arg)=>ZodBoolean.create({
            ...arg,
            coerce: true
        }),
    bigint: (arg)=>ZodBigInt.create({
            ...arg,
            coerce: true
        }),
    date: (arg)=>ZodDate.create({
            ...arg,
            coerce: true
        })
};
const NEVER = INVALID;

var z = /*#__PURE__*/Object.freeze({
    __proto__: null,
    BRAND: BRAND,
    DIRTY: DIRTY,
    EMPTY_PATH: EMPTY_PATH,
    INVALID: INVALID,
    NEVER: NEVER,
    OK: OK,
    ParseStatus: ParseStatus,
    Schema: ZodType,
    ZodAny: ZodAny,
    ZodArray: ZodArray,
    ZodBigInt: ZodBigInt,
    ZodBoolean: ZodBoolean,
    ZodBranded: ZodBranded,
    ZodCatch: ZodCatch,
    ZodDate: ZodDate,
    ZodDefault: ZodDefault,
    ZodDiscriminatedUnion: ZodDiscriminatedUnion,
    ZodEffects: ZodEffects,
    ZodEnum: ZodEnum,
    ZodError: ZodError,
    get ZodFirstPartyTypeKind () { return ZodFirstPartyTypeKind; },
    ZodFunction: ZodFunction,
    ZodIntersection: ZodIntersection,
    ZodIssueCode: ZodIssueCode,
    ZodLazy: ZodLazy,
    ZodLiteral: ZodLiteral,
    ZodMap: ZodMap,
    ZodNaN: ZodNaN,
    ZodNativeEnum: ZodNativeEnum,
    ZodNever: ZodNever,
    ZodNull: ZodNull,
    ZodNullable: ZodNullable,
    ZodNumber: ZodNumber,
    ZodObject: ZodObject,
    ZodOptional: ZodOptional,
    ZodParsedType: ZodParsedType,
    ZodPipeline: ZodPipeline,
    ZodPromise: ZodPromise,
    ZodReadonly: ZodReadonly,
    ZodRecord: ZodRecord,
    ZodSchema: ZodType,
    ZodSet: ZodSet,
    ZodString: ZodString,
    ZodSymbol: ZodSymbol,
    ZodTransformer: ZodEffects,
    ZodTuple: ZodTuple,
    ZodType: ZodType,
    ZodUndefined: ZodUndefined,
    ZodUnion: ZodUnion,
    ZodUnknown: ZodUnknown,
    ZodVoid: ZodVoid,
    addIssueToContext: addIssueToContext,
    any: anyType,
    array: arrayType,
    bigint: bigIntType,
    boolean: booleanType,
    coerce: coerce,
    custom: custom,
    date: dateType,
    defaultErrorMap: errorMap,
    discriminatedUnion: discriminatedUnionType,
    effect: effectsType,
    enum: enumType,
    function: functionType,
    getErrorMap: getErrorMap,
    getParsedType: getParsedType,
    instanceof: instanceOfType,
    intersection: intersectionType,
    isAborted: isAborted,
    isAsync: isAsync,
    isDirty: isDirty,
    isValid: isValid,
    late: late,
    lazy: lazyType,
    literal: literalType,
    makeIssue: makeIssue,
    map: mapType,
    nan: nanType,
    nativeEnum: nativeEnumType,
    never: neverType,
    null: nullType,
    nullable: nullableType,
    number: numberType,
    object: objectType,
    get objectUtil () { return objectUtil; },
    oboolean: oboolean,
    onumber: onumber,
    optional: optionalType,
    ostring: ostring,
    pipeline: pipelineType,
    preprocess: preprocessType,
    promise: promiseType,
    quotelessJson: quotelessJson,
    record: recordType,
    set: setType,
    setErrorMap: setErrorMap,
    strictObject: strictObjectType,
    string: stringType,
    symbol: symbolType,
    transformer: effectsType,
    tuple: tupleType,
    undefined: undefinedType,
    union: unionType,
    unknown: unknownType,
    get util () { return util; },
    void: voidType
});

const generateRandomString = (length = 10)=>{
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for(let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

class AtomMap {
    #atom = new Map();
    get(key) {
        if (!this.#atom.has(key)) {
            const randomStr = generateRandomString();
            const value = createAtom(`${randomStr}:${key}`);
            this.#atom.set(key, value);
            return value;
        }
        return this.#atom.get(key);
    }
}
const createAtomMap = ()=>new AtomMap();
function createBasicZodStore(v) {
    let currentValue = undefined;
    const atom = createAtom(generateRandomString());
    return new Proxy({
        value: currentValue
    }, {
        get: (_target, prop)=>{
            if (prop === "value") {
                atom.reportObserved();
                if (currentValue == undefined) {
                    return v.parse(currentValue);
                }
                return currentValue;
            }
        },
        set: (_target, prop, value)=>{
            if (prop === "value") {
                currentValue = v.parse(value);
                atom.reportChanged();
                return true;
            }
            return false;
        }
    });
}
function createZodStore(obj, skip = []) {
    return new class {
        /** @ts-expect-error: this is accessed */ #values = {};
        constructor(){
            const observables = createAtomMap();
            const skipped = skip.map(({ key })=>key);
            for (const { key, get, set } of skip){
                // So we can get all keys with Object.keys
                this[key] = undefined;
                Object.defineProperty(this, key, {
                    get,
                    set: set ?? undefined
                });
            }
            for (const key of Object.keys(obj)){
                if (skipped.includes(key)) {
                    continue;
                }
                if ("safeParse" in obj[key] && typeof obj[key] !== "function") {
                    const newValue = obj[key].safeParse(undefined);
                    if (newValue.success) {
                        this.#values[key] = newValue.data;
                    }
                }
                // So we can get all keys with Object.keys
                this[key] = true;
                Object.defineProperty(this, key, {
                    get: ()=>{
                        observables.get(key).reportObserved();
                        if (typeof this.#values[key] === "undefined") {
                            if (typeof obj[key] === "function") {
                                this.#values[key] = obj[key];
                            } else {
                                this.#values[key] = obj[key].parse(undefined);
                            }
                        }
                        return this.#values[key];
                    },
                    set: (value)=>{
                        if (typeof obj[key] === "function") {
                            observables.get(key).reportChanged();
                            // ANY forced - this can't be zod
                            this.#values[key] = obj[key]._wrapper(value);
                            return true;
                        }
                        this.#values[key] = obj[key].parse(value);
                        observables.get(key).reportChanged();
                        return true;
                    }
                });
            }
        }
    }();
}
const wrapContext = (obj, config, stack = [
    config.appName
])=>{
    const functionParams = Object.entries(obj).filter(([_key, value])=>typeof value === "function");
    const skip = [
        {
            key: "stack",
            get: ()=>stack
        },
        ...functionParams.map(([key, value])=>{
            return {
                key,
                get: ()=>{
                    return (val)=>{
                        const newContext = wrapContext(obj, config, [
                            ...stack,
                            key
                        ]);
                        return value(newContext, config, val);
                    };
                }
            };
        })
    ];
    return new class {
        /** @ts-expect-error: this is accessed */ #values = {};
        constructor(){
            const skipped = skip.map(({ key })=>key);
            for (const { key, get } of skip){
                // So we can get all keys with Object.keys
                this[key] = undefined;
                Object.defineProperty(this, key, {
                    get
                });
            }
            for (const key of Object.keys(obj)){
                if (skipped.includes(key)) {
                    continue;
                }
                // So we can get all keys with Object.keys
                this[key] = true;
                Object.defineProperty(this, key, {
                    get: ()=>{
                        return obj[key];
                    },
                    set: (value)=>{
                        obj[key] = value;
                        return true;
                    }
                });
            }
        }
    }();
};
const createLockStore = ()=>{
    return new class {
        #atom = createAtomMap();
        #map = new Map();
        #lockKey = (key)=>{
            this.#map.set(key, true);
            this.#atom.get(key).reportChanged();
        };
        #unlock = (key)=>{
            this.#map.set(key, false);
            this.#atom.get(key).reportChanged();
        };
        isLocked(key) {
            this.#atom.get(key).reportObserved();
            return this.#map.has(key) ? this.#map.get(key) === true : false;
        }
        waitForLock(key) {
            return new Promise((resolve)=>{
                const fn = {};
                fn.stopWait = autorun(()=>{
                    this.#atom.get(key).reportObserved();
                    const isLocked = this.isLocked(key);
                    if (!isLocked) {
                        resolve();
                        if (!fn.stopWait) {
                            return;
                        }
                        fn.stopWait();
                    }
                });
            });
        }
        async lock(key, fn) {
            await this.waitForLock(key);
            this.#lockKey(key);
            let value;
            try {
                value = await fn();
            } catch (e) {
                this.#unlock(key);
                throw e;
            }
            this.#unlock(key);
            return value;
        }
    }();
};
const createZodKeyStore = (type)=>{
    return new class {
        #type;
        #atom = createAtomMap();
        #map = new Map();
        #lock = createLockStore();
        #allKeys = new Set();
        constructor(){
            this.#type = type;
        }
        async getAll() {
            const values = {};
            this.#atom.get("#getAll").reportObserved();
            for (const key of Array.from(this.#allKeys)){
                const value = await this.getKey(key);
                values[key] = value;
            }
            return values;
        }
        awaitForAvailability(key) {
            return new Promise((resolve)=>{
                const fn = {};
                fn.stopWaiting = autorun(async ()=>{
                    this.#atom.get(key).reportObserved();
                    const value = await this.getKey(key);
                    if (value !== null) {
                        resolve(value);
                        if (!fn.stopWaiting) {
                            return;
                        }
                        fn.stopWaiting();
                    }
                });
            });
        }
        async getKey(key) {
            this.#atom.get(key).reportObserved();
            const value = await this.#lock.lock(key, ()=>{
                this.#atom.get(key).reportObserved();
                if (!this.#map.has(key)) {
                    const value = this.#type.safeParse(undefined);
                    if (value.success) {
                        return value.data;
                    }
                }
                return !this.#map.has(key) ? null : this.#map.get(key);
            });
            return value;
        }
        async setKey(key, value) {
            await this.#lock.lock(key, ()=>{
                this.#map.set(key, this.#type.parse(value));
                this.#allKeys.add(key);
                this.#atom.get(key).reportChanged();
                this.#atom.get("#getAll").reportChanged();
            });
        }
        async getOrSet(key, fn) {
            this.#atom.get(key).reportObserved();
            const value = await this.#lock.lock(key, async ()=>{
                if (!this.#map.has(key)) {
                    const newValue = await fn();
                    this.#atom.get(key).reportChanged();
                    this.#atom.get("#getAll").reportChanged();
                    this.#allKeys.add(key);
                    this.#map.set(key, newValue);
                    return newValue;
                }
                return this.#map.get(key);
            });
            return value;
        }
    }();
};
const globalstore = {};
const globalLock = createLockStore();
const createGlobalZodStore = (obj, key)=>{
    return globalLock.lock(key, ()=>{
        if (globalstore[key]) {
            return globalstore[key];
        }
        globalstore[key] = createZodStore(obj);
        return globalstore[key];
    });
};
const createGlobalZodKeyStore = (obj, key)=>{
    return globalLock.lock(key, ()=>{
        if (globalstore[key]) {
            return globalstore[key];
        }
        globalstore[key] = createZodKeyStore(obj);
        return globalstore[key];
    });
};
const globalSymbol = new Map();
let currentKey = 0;
const createZodSymbolStore = (obj)=>{
    const getSymbolKey = (symbol)=>{
        let hashKey;
        if (globalSymbol.has(symbol)) {
            hashKey = globalSymbol.get(symbol);
        } else {
            hashKey = `Symbol(id: ${currentKey++})`;
            globalSymbol.set(symbol, hashKey);
        }
        return hashKey;
    };
    const store = createZodKeyStore(obj);
    const allKeys = {};
    return {
        awaitForAvailability: (symbol)=>{
            const key = getSymbolKey(symbol);
            return store.awaitForAvailability(key);
        },
        getAll: async ()=>{
            const values = await store.getAll();
            const obj = {};
            for (const key of Object.keys(values)){
                const symbol = allKeys[key];
                obj[symbol] = values[key];
            }
            return obj;
        },
        getKey: (symbol)=>{
            const key = getSymbolKey(symbol);
            return store.getKey(key);
        },
        getOrSet: (symbol, fn)=>{
            const key = getSymbolKey(symbol);
            allKeys[key] = symbol;
            return store.getOrSet(key, fn);
        },
        setKey: (symbol, value)=>{
            const key = getSymbolKey(symbol);
            allKeys[key] = symbol;
            return store.setKey(key, value);
        }
    };
};

const getMostInnerZodType = (schema, prev = null)=>{
    // Check if the current schema has an innerType
    if (schema instanceof ZodString) {
        return "string";
    }
    if (schema instanceof ZodNumber) {
        return "number";
    }
    if (schema instanceof ZodBoolean) {
        return "boolean";
    }
    if (schema instanceof ZodLiteral) {
        return "literal";
    }
    if (schema instanceof ZodArray) {
        return `array:${getMostInnerZodType(schema._def.type, "array")}`;
    }
    if (schema instanceof ZodUnion) {
        return `union:literal`;
    }
    const inner = schema._def?.innerType;
    if (inner) {
        return getMostInnerZodType(inner);
    }
    throw new Error("Not implemented yet for env");
};
const oldDefault = ZodType.prototype.default;
const getArgv = (context, options)=>{
    if (options === undefined || // Arg overwrites env
    options.arg === undefined) {
        return null;
    }
    const fn = oldDefault.bind(context);
    const zodType = getMostInnerZodType(context);
    const argOptions = {
        type: zodType === "boolean" || zodType === "array:boolean" ? "boolean" : "string",
        multiple: zodType.startsWith("array:")
    };
    if (options.arg.short !== undefined) {
        argOptions.short = options.arg.short;
    }
    const { values, positionals } = parseArgs({
        args: process.argv.slice(2),
        options: options.arg?.long ? {
            [options.arg.long]: argOptions
        } : {},
        allowPositionals: true,
        strict: false
    });
    const value = (()=>{
        if (options.arg?.positional && positionals.length !== 0) {
            return positionals;
        }
        return options?.arg?.long ? values[options.arg.long] : undefined;
    })();
    if (value != undefined) {
        switch(zodType){
            case "string":
            case "literal":
            case `union:literal`:
                if (Array.isArray(value)) {
                    return fn(value[0]);
                }
                return fn(value);
            case "number":
                if (Array.isArray(value)) {
                    return fn(Number(value[0]));
                }
                return fn(Number(value));
            case "boolean":
                if (Array.isArray(value)) {
                    return fn(value[0]);
                }
                return fn(value);
            case `array:string`:
            case `array:literal`:
                if (Array.isArray(value)) {
                    return fn(value);
                }
                if (typeof value === "string") {
                    return fn(value.split(","));
                }
                return fn(undefined);
            case `array:number`:
                if (Array.isArray(value) && value.every((v)=>!Number.isNaN(Number(v)))) {
                    return fn(value.map(Number));
                }
                if (typeof value === "string") {
                    return fn(value.split(",").map(Number));
                }
                return fn(undefined);
            case `array:boolean`:
                return fn(value);
            default:
                throw new Error(`Not implemented yet for this type ${zodType}`);
        }
    }
    return null;
};
const getEnv = (context, options)=>{
    if (options === undefined || options.env === undefined) {
        return null;
    }
    const fn = oldDefault.bind(context);
    const value = process.env[options.env];
    if (value !== undefined) {
        const zodType = getMostInnerZodType(context);
        switch(zodType){
            case "string":
            case `union:literal`:
            case "literal":
                return fn(value);
            case "number":
                return fn(Number(value));
            case "boolean":
                return fn(value === "true");
            case `array:string`:
                return fn(value.split(","));
            case `array:number`:
                return fn(value.split(",").map(Number));
            case `array:boolean`:
                return fn(value.split(",").map((v)=>v === "true"));
            default:
                throw new Error(`Not implemented yet for this type ${zodType}`);
        }
    }
    return null;
};
ZodType.prototype.default = function(def, options) {
    const fn = oldDefault.bind(this);
    return getArgv(this, options) || getEnv(this, options) || fn(def);
};

const PipesConfig = {
    isDev: booleanType().default(ciinfo.isCI, {
        env: "IS_DEV",
        arg: {
            long: "show-dev-logs"
        }
    }).parse(undefined)
};

const internalStateSchema = unionType([
    literalType("running"),
    literalType("waiting"),
    literalType("waiting_for_dependency"),
    literalType("finished"),
    literalType("failed")
]).default("waiting");
const taskSchema = arrayType(symbolType()).default([]);
const loaderStateSchema = unionType([
    literalType("initializing"),
    literalType("starting"),
    literalType("running"),
    literalType("finished")
]).default("initializing");
const internalStateStoreSchema = objectType({
    name: stringType().default("Unnamed"),
    state: internalStateSchema
});
const stateStoreSchema = {
    symbolsOfTasksCompleted: taskSchema,
    symbolsOfTasksFailed: taskSchema,
    symbolsOfTasks: taskSchema,
    state: loaderStateSchema
};
function createInternalState() {
    return createZodStore({
        state: internalStateSchema,
        name: stringType().default("Unnamed")
    });
}
function createState() {
    return createZodStore({
        symbolsOfTasksCompleted: taskSchema,
        symbolsOfTasksFailed: taskSchema,
        symbolsOfTasks: taskSchema,
        state: loaderStateSchema
    });
}

/// <reference path="../global.d.ts" />
/**
 * `<Box>` is an essential Ink component to build your layout. It's like `<div style="display: flex">` in the browser.
 */ const Box = /*#__PURE__*/ forwardRef(({ children, ...style }, ref)=>{
    return /*#__PURE__*/ React.createElement("ink-box", {
        ref: ref,
        style: {
            ...style,
            overflowX: style.overflowX ?? style.overflow ?? "visible",
            overflowY: style.overflowY ?? style.overflow ?? "visible"
        }
    }, children);
});
Box.displayName = "Box";
Box.defaultProps = {
    flexWrap: "nowrap",
    flexDirection: "row",
    flexGrow: 0,
    flexShrink: 1
};

const rgbRegex = /^rgb\(\s?(\d+),\s?(\d+),\s?(\d+)\s?\)$/;
const ansiRegex = /^ansi256\(\s?(\d+)\s?\)$/;
const isNamedColor = (color)=>{
    return color in chalk;
};
const colorize = (str, color, type)=>{
    if (!color) {
        return str;
    }
    if (isNamedColor(color)) {
        if (type === "foreground") {
            return chalk[color](str);
        }
        const methodName = `bg${color[0].toUpperCase() + color.slice(1)}`;
        return chalk[methodName](str);
    }
    if (color.startsWith("#")) {
        return type === "foreground" ? chalk.hex(color)(str) : chalk.bgHex(color)(str);
    }
    if (color.startsWith("ansi256")) {
        const matches = ansiRegex.exec(color);
        if (!matches) {
            return str;
        }
        const value = Number(matches[1]);
        return type === "foreground" ? chalk.ansi256(value)(str) : chalk.bgAnsi256(value)(str);
    }
    if (color.startsWith("rgb")) {
        const matches = rgbRegex.exec(color);
        if (!matches) {
            return str;
        }
        const firstValue = Number(matches[1]);
        const secondValue = Number(matches[2]);
        const thirdValue = Number(matches[3]);
        return type === "foreground" ? chalk.rgb(firstValue, secondValue, thirdValue)(str) : chalk.bgRgb(firstValue, secondValue, thirdValue)(str);
    }
    return str;
};

/// <reference path="../global.d.ts" />
/**
 * This component can display text, and change its style to make it colorful, bold, underline, italic or strikethrough.
 */ function Text({ color, backgroundColor, dimColor = false, bold = false, italic = false, underline = false, strikethrough = false, inverse = false, wrap = "wrap", children }) {
    if (children === undefined || children === null) {
        return null;
    }
    const transform = (children)=>{
        if (dimColor) {
            children = chalk.dim(children);
        }
        if (color) {
            children = colorize(children, color, "foreground");
        }
        if (backgroundColor) {
            children = colorize(children, backgroundColor, "background");
        }
        if (bold) {
            children = chalk.bold(children);
        }
        if (italic) {
            children = chalk.italic(children);
        }
        if (underline) {
            children = chalk.underline(children);
        }
        if (strikethrough) {
            children = chalk.strikethrough(children);
        }
        if (inverse) {
            children = chalk.inverse(children);
        }
        return children;
    };
    return /*#__PURE__*/ React.createElement("ink-text", {
        style: {
            flexGrow: 0,
            flexShrink: 1,
            flexDirection: "row",
            textWrap: wrap
        },
        internal_transform: transform
    }, children);
}

// Error's source file is reported as file:///home/user/file.js
// This function removes the file://[cwd] part
const cleanupPath = (path)=>{
    return path?.replace(`file://${cwd()}/`, "");
};
const stackUtils = new StackUtils({
    cwd: cwd(),
    internals: StackUtils.nodeInternals()
});
function ErrorOverview({ error }) {
    const stack = error.stack ? error.stack.split("\n").slice(1) : undefined;
    const origin = stack ? stackUtils.parseLine(stack[0]) : undefined;
    const filePath = cleanupPath(origin?.file);
    let excerpt;
    let lineWidth = 0;
    if (filePath && origin?.line && fs.existsSync(filePath)) {
        const sourceCode = fs.readFileSync(filePath, "utf8");
        excerpt = codeExcerpt(sourceCode, origin.line);
        if (excerpt) {
            for (const { line } of excerpt){
                lineWidth = Math.max(lineWidth, String(line).length);
            }
        }
    }
    return /*#__PURE__*/ React.createElement(Box, {
        flexDirection: "column",
        padding: 1
    }, /*#__PURE__*/ React.createElement(Box, null, /*#__PURE__*/ React.createElement(Text, {
        backgroundColor: "red",
        color: "white"
    }, " ", "ERROR", " "), /*#__PURE__*/ React.createElement(Text, null, " ", error.message)), origin && filePath && /*#__PURE__*/ React.createElement(Box, {
        marginTop: 1
    }, /*#__PURE__*/ React.createElement(Text, {
        dimColor: true
    }, filePath, ":", origin.line, ":", origin.column)), origin && excerpt && /*#__PURE__*/ React.createElement(Box, {
        marginTop: 1,
        flexDirection: "column"
    }, excerpt.map(({ line, value })=>/*#__PURE__*/ React.createElement(Box, {
            key: line
        }, /*#__PURE__*/ React.createElement(Box, {
            width: lineWidth + 1
        }, /*#__PURE__*/ React.createElement(Text, {
            dimColor: line !== origin.line,
            backgroundColor: line === origin.line ? "red" : undefined,
            color: line === origin.line ? "white" : undefined
        }, String(line).padStart(lineWidth, " "), ":")), /*#__PURE__*/ React.createElement(Text, {
            key: line,
            backgroundColor: line === origin.line ? "red" : undefined,
            color: line === origin.line ? "white" : undefined
        }, ` ${value}`)))), error.stack && /*#__PURE__*/ React.createElement(Box, {
        marginTop: 1,
        flexDirection: "column"
    }, error.stack.split("\n").slice(1).map((line)=>{
        const parsedLine = stackUtils.parseLine(line);
        // If the line from the stack cannot be parsed, we print out the unparsed line.
        if (!parsedLine) {
            return /*#__PURE__*/ React.createElement(Box, {
                key: line
            }, /*#__PURE__*/ React.createElement(Text, {
                dimColor: true
            }, "- "), /*#__PURE__*/ React.createElement(Text, {
                dimColor: true,
                bold: true
            }, line));
        }
        return /*#__PURE__*/ React.createElement(Box, {
            key: line
        }, /*#__PURE__*/ React.createElement(Text, {
            dimColor: true
        }, "- "), /*#__PURE__*/ React.createElement(Text, {
            dimColor: true,
            bold: true
        }, parsedLine.function), /*#__PURE__*/ React.createElement(Text, {
            dimColor: true,
            color: "gray"
        }, " ", "(", cleanupPath(parsedLine.file) ?? "", ":", parsedLine.line, ":", parsedLine.column, ")"));
    })));
}

// Root component for all Ink apps
// It renders stdin and stdout contexts, so that children can access them if needed
// It also handles Ctrl+C exiting and cursor visibility
class App extends PureComponent {
    static displayName = "InternalApp";
    static getDerivedStateFromError(error) {
        return {
            error
        };
    }
    state = {
        isFocusEnabled: true,
        activeFocusId: undefined,
        focusables: [],
        error: undefined
    };
    // Count how many components enabled raw mode to avoid disabling
    // raw mode until all components don't need it anymore
    rawModeEnabledCount = 0;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    internal_eventEmitter = new EventEmitter();
    render() {
        return /*#__PURE__*/ React.createElement(React.Fragment, null, this.state.error ? /*#__PURE__*/ React.createElement(ErrorOverview, {
            error: this.state.error
        }) : this.props.children);
    }
    componentDidMount() {}
    componentWillUnmount() {}
}

const getScreenWidth = ()=>{
    const isTest = import.meta.url.includes(".spec.");
    return isTest ? 80 : Math.min(process.stdout.columns ?? 80, 80);
};

const cache$1 = {};
const measureText = (text)=>{
    if (text.length === 0) {
        return {
            width: 0,
            height: 0
        };
    }
    const cachedDimensions = cache$1[text];
    if (cachedDimensions) {
        return cachedDimensions;
    }
    const width = widestLine(text);
    const height = text.split("\n").length;
    cache$1[text] = {
        width,
        height
    };
    return {
        width,
        height
    };
};

// Squashing text nodes allows to combine multiple text nodes into one and write
// to `Output` instance only once. For example, <Text>hello{' '}world</Text>
// is actually 3 text nodes, which would result 3 writes to `Output`.
//
// Also, this is necessary for libraries like ink-link (https://github.com/sindresorhus/ink-link),
// which need to wrap all children at once, instead of wrapping 3 text nodes separately.
const squashTextNodes = (node)=>{
    let text = "";
    for(let index = 0; index < node.childNodes.length; index++){
        const childNode = node.childNodes[index];
        if (childNode === undefined) {
            continue;
        }
        let nodeText = "";
        if (childNode.nodeName === "#text") {
            nodeText = childNode.nodeValue;
        } else {
            if (childNode.nodeName === "ink-text" || childNode.nodeName === "ink-virtual-text") {
                nodeText = squashTextNodes(childNode);
            }
            // Since these text nodes are being concatenated, `Output` instance won't be able to
            // apply children transform, so we have to do it manually here for each text node
            if (nodeText.length > 0 && typeof childNode.internal_transform === "function") {
                nodeText = childNode.internal_transform(nodeText, index);
            }
        }
        text += nodeText;
    }
    return text;
};

const cache = {};
const wrapText = (text, maxWidth, wrapType)=>{
    const cacheKey = text + String(maxWidth) + String(wrapType);
    const cachedText = cache[cacheKey];
    if (cachedText) {
        return cachedText;
    }
    let wrappedText = text;
    if (wrapType === "wrap") {
        wrappedText = wrapAnsi(text, maxWidth, {
            trim: false,
            hard: true
        });
    }
    if (wrapType.startsWith("truncate")) {
        let position = "end";
        if (wrapType === "truncate-middle") {
            position = "middle";
        }
        if (wrapType === "truncate-start") {
            position = "start";
        }
        wrappedText = cliTruncate(text, maxWidth, {
            position
        });
    }
    cache[cacheKey] = wrappedText;
    return wrappedText;
};

const createNode = (nodeName)=>{
    const node = {
        nodeName,
        style: {},
        attributes: {},
        childNodes: [],
        parentNode: undefined,
        yogaNode: nodeName === "ink-virtual-text" ? undefined : Yoga.Node.create()
    };
    if (nodeName === "ink-text") {
        node.yogaNode?.setMeasureFunc(measureTextNode.bind(null, node));
    }
    return node;
};
const appendChildNode = (node, childNode)=>{
    if (childNode.parentNode) {
        removeChildNode(childNode.parentNode, childNode);
    }
    childNode.parentNode = node;
    node.childNodes.push(childNode);
    if (childNode.yogaNode) {
        node.yogaNode?.insertChild(childNode.yogaNode, node.yogaNode.getChildCount());
    }
    if (node.nodeName === "ink-text" || node.nodeName === "ink-virtual-text") {
        markNodeAsDirty(node);
    }
};
const insertBeforeNode = (node, newChildNode, beforeChildNode)=>{
    if (newChildNode.parentNode) {
        removeChildNode(newChildNode.parentNode, newChildNode);
    }
    newChildNode.parentNode = node;
    const index = node.childNodes.indexOf(beforeChildNode);
    if (index >= 0) {
        node.childNodes.splice(index, 0, newChildNode);
        if (newChildNode.yogaNode) {
            node.yogaNode?.insertChild(newChildNode.yogaNode, index);
        }
        return;
    }
    node.childNodes.push(newChildNode);
    if (newChildNode.yogaNode) {
        node.yogaNode?.insertChild(newChildNode.yogaNode, node.yogaNode.getChildCount());
    }
    if (node.nodeName === "ink-text" || node.nodeName === "ink-virtual-text") {
        markNodeAsDirty(node);
    }
};
const removeChildNode = (node, removeNode)=>{
    if (removeNode.yogaNode) {
        removeNode.parentNode?.yogaNode?.removeChild(removeNode.yogaNode);
    }
    removeNode.parentNode = undefined;
    const index = node.childNodes.indexOf(removeNode);
    if (index >= 0) {
        node.childNodes.splice(index, 1);
    }
    if (node.nodeName === "ink-text" || node.nodeName === "ink-virtual-text") {
        markNodeAsDirty(node);
    }
};
const setAttribute = (node, key, value)=>{
    node.attributes[key] = value;
};
const setStyle = (node, style)=>{
    node.style = style;
};
const createTextNode = (text)=>{
    const node = {
        nodeName: "#text",
        nodeValue: text,
        yogaNode: undefined,
        parentNode: undefined,
        style: {}
    };
    setTextNodeValue(node, text);
    return node;
};
const measureTextNode = function(node, width) {
    const text = node.nodeName === "#text" ? node.nodeValue : squashTextNodes(node);
    const dimensions = measureText(text);
    // Text fits into container, no need to wrap
    if (dimensions.width <= width) {
        return dimensions;
    }
    // This is happening when <Box> is shrinking child nodes and Yoga asks
    // if we can fit this text node in a <1px space, so we just tell Yoga "no"
    if (dimensions.width >= 1 && width > 0 && width < 1) {
        return dimensions;
    }
    const textWrap = node.style?.textWrap ?? "wrap";
    const wrappedText = wrapText(text, width, textWrap);
    return measureText(wrappedText);
};
const findClosestYogaNode = (node)=>{
    if (!node?.parentNode) {
        return undefined;
    }
    return node.yogaNode ?? findClosestYogaNode(node.parentNode);
};
const markNodeAsDirty = (node)=>{
    // Mark closest Yoga node as dirty to measure text dimensions again
    const yogaNode = findClosestYogaNode(node);
    yogaNode?.markDirty();
};
const setTextNodeValue = (node, text)=>{
    if (typeof text !== "string") {
        text = String(text);
    }
    node.nodeValue = text;
    markNodeAsDirty(node);
};

const applyPositionStyles = (node, style)=>{
    if ("position" in style) {
        node.setPositionType(style.position === "absolute" ? Yoga.POSITION_TYPE_ABSOLUTE : Yoga.POSITION_TYPE_RELATIVE);
    }
};
const applyMarginStyles = (node, style)=>{
    if ("margin" in style) {
        node.setMargin(Yoga.EDGE_ALL, style.margin ?? 0);
    }
    if ("marginX" in style) {
        node.setMargin(Yoga.EDGE_HORIZONTAL, style.marginX ?? 0);
    }
    if ("marginY" in style) {
        node.setMargin(Yoga.EDGE_VERTICAL, style.marginY ?? 0);
    }
    if ("marginLeft" in style) {
        node.setMargin(Yoga.EDGE_START, style.marginLeft || 0);
    }
    if ("marginRight" in style) {
        node.setMargin(Yoga.EDGE_END, style.marginRight || 0);
    }
    if ("marginTop" in style) {
        node.setMargin(Yoga.EDGE_TOP, style.marginTop || 0);
    }
    if ("marginBottom" in style) {
        node.setMargin(Yoga.EDGE_BOTTOM, style.marginBottom || 0);
    }
};
const applyPaddingStyles = (node, style)=>{
    if ("padding" in style) {
        node.setPadding(Yoga.EDGE_ALL, style.padding ?? 0);
    }
    if ("paddingX" in style) {
        node.setPadding(Yoga.EDGE_HORIZONTAL, style.paddingX ?? 0);
    }
    if ("paddingY" in style) {
        node.setPadding(Yoga.EDGE_VERTICAL, style.paddingY ?? 0);
    }
    if ("paddingLeft" in style) {
        node.setPadding(Yoga.EDGE_LEFT, style.paddingLeft || 0);
    }
    if ("paddingRight" in style) {
        node.setPadding(Yoga.EDGE_RIGHT, style.paddingRight || 0);
    }
    if ("paddingTop" in style) {
        node.setPadding(Yoga.EDGE_TOP, style.paddingTop || 0);
    }
    if ("paddingBottom" in style) {
        node.setPadding(Yoga.EDGE_BOTTOM, style.paddingBottom || 0);
    }
};
const applyFlexStyles = (node, style)=>{
    if ("flexGrow" in style) {
        node.setFlexGrow(style.flexGrow ?? 0);
    }
    if ("flexShrink" in style) {
        node.setFlexShrink(typeof style.flexShrink === "number" ? style.flexShrink : 1);
    }
    if ("flexWrap" in style) {
        if (style.flexWrap === "nowrap") {
            node.setFlexWrap(Yoga.WRAP_NO_WRAP);
        }
        if (style.flexWrap === "wrap") {
            node.setFlexWrap(Yoga.WRAP_WRAP);
        }
        if (style.flexWrap === "wrap-reverse") {
            node.setFlexWrap(Yoga.WRAP_WRAP_REVERSE);
        }
    }
    if ("flexDirection" in style) {
        if (style.flexDirection === "row") {
            node.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
        }
        if (style.flexDirection === "row-reverse") {
            node.setFlexDirection(Yoga.FLEX_DIRECTION_ROW_REVERSE);
        }
        if (style.flexDirection === "column") {
            node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
        }
        if (style.flexDirection === "column-reverse") {
            node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN_REVERSE);
        }
    }
    if ("flexBasis" in style) {
        if (typeof style.flexBasis === "number") {
            node.setFlexBasis(style.flexBasis);
        } else if (typeof style.flexBasis === "string") {
            node.setFlexBasisPercent(Number.parseInt(style.flexBasis, 10));
        } else {
            // This should be replaced with node.setFlexBasisAuto() when new Yoga release is out
            node.setFlexBasis(Number.NaN);
        }
    }
    if ("alignItems" in style) {
        if (style.alignItems === "stretch" || !style.alignItems) {
            node.setAlignItems(Yoga.ALIGN_STRETCH);
        }
        if (style.alignItems === "flex-start") {
            node.setAlignItems(Yoga.ALIGN_FLEX_START);
        }
        if (style.alignItems === "center") {
            node.setAlignItems(Yoga.ALIGN_CENTER);
        }
        if (style.alignItems === "flex-end") {
            node.setAlignItems(Yoga.ALIGN_FLEX_END);
        }
    }
    if ("alignSelf" in style) {
        if (style.alignSelf === "auto" || !style.alignSelf) {
            node.setAlignSelf(Yoga.ALIGN_AUTO);
        }
        if (style.alignSelf === "flex-start") {
            node.setAlignSelf(Yoga.ALIGN_FLEX_START);
        }
        if (style.alignSelf === "center") {
            node.setAlignSelf(Yoga.ALIGN_CENTER);
        }
        if (style.alignSelf === "flex-end") {
            node.setAlignSelf(Yoga.ALIGN_FLEX_END);
        }
    }
    if ("justifyContent" in style) {
        if (style.justifyContent === "flex-start" || !style.justifyContent) {
            node.setJustifyContent(Yoga.JUSTIFY_FLEX_START);
        }
        if (style.justifyContent === "center") {
            node.setJustifyContent(Yoga.JUSTIFY_CENTER);
        }
        if (style.justifyContent === "flex-end") {
            node.setJustifyContent(Yoga.JUSTIFY_FLEX_END);
        }
        if (style.justifyContent === "space-between") {
            node.setJustifyContent(Yoga.JUSTIFY_SPACE_BETWEEN);
        }
        if (style.justifyContent === "space-around") {
            node.setJustifyContent(Yoga.JUSTIFY_SPACE_AROUND);
        }
    }
};
const applyDimensionStyles = (node, style)=>{
    if ("width" in style) {
        if (typeof style.width === "number") {
            node.setWidth(style.width);
        } else if (typeof style.width === "string") {
            node.setWidthPercent(Number.parseInt(style.width, 10));
        } else {
            node.setWidthAuto();
        }
    }
    if ("height" in style) {
        if (typeof style.height === "number") {
            node.setHeight(style.height);
        } else if (typeof style.height === "string") {
            node.setHeightPercent(Number.parseInt(style.height, 10));
        } else {
            node.setHeightAuto();
        }
    }
    if ("minWidth" in style) {
        if (typeof style.minWidth === "string") {
            node.setMinWidthPercent(Number.parseInt(style.minWidth, 10));
        } else {
            node.setMinWidth(style.minWidth ?? 0);
        }
    }
    if ("minHeight" in style) {
        if (typeof style.minHeight === "string") {
            node.setMinHeightPercent(Number.parseInt(style.minHeight, 10));
        } else {
            node.setMinHeight(style.minHeight ?? 0);
        }
    }
};
const applyDisplayStyles = (node, style)=>{
    if ("display" in style) {
        node.setDisplay(style.display === "flex" ? Yoga.DISPLAY_FLEX : Yoga.DISPLAY_NONE);
    }
};
const applyBorderStyles = (node, style)=>{
    if ("borderStyle" in style) {
        const borderWidth = style.borderStyle ? 1 : 0;
        if (style.borderTop !== false) {
            node.setBorder(Yoga.EDGE_TOP, borderWidth);
        }
        if (style.borderBottom !== false) {
            node.setBorder(Yoga.EDGE_BOTTOM, borderWidth);
        }
        if (style.borderLeft !== false) {
            node.setBorder(Yoga.EDGE_LEFT, borderWidth);
        }
        if (style.borderRight !== false) {
            node.setBorder(Yoga.EDGE_RIGHT, borderWidth);
        }
    }
};
const applyGapStyles = (node, style)=>{
    if ("gap" in style) {
        node.setGap(Yoga.GUTTER_ALL, style.gap ?? 0);
    }
    if ("columnGap" in style) {
        node.setGap(Yoga.GUTTER_COLUMN, style.columnGap ?? 0);
    }
    if ("rowGap" in style) {
        node.setGap(Yoga.GUTTER_ROW, style.rowGap ?? 0);
    }
};
const styles = (node, style = {})=>{
    applyPositionStyles(node, style);
    applyMarginStyles(node, style);
    applyPaddingStyles(node, style);
    applyFlexStyles(node, style);
    applyDimensionStyles(node, style);
    applyDisplayStyles(node, style);
    applyBorderStyles(node, style);
    applyGapStyles(node, style);
};

// FIX ROLLUP
const DefaultEventPriority = 0b0000000000000000000000000010000;
const diff = (before, after)=>{
    if (before === after) {
        return;
    }
    if (!before) {
        return after;
    }
    const changed = {};
    let isChanged = false;
    for (const key of Object.keys(before)){
        const isDeleted = after ? !Object.hasOwnProperty.call(after, key) : true;
        if (isDeleted) {
            changed[key] = undefined;
            isChanged = true;
        }
    }
    if (after) {
        for (const key of Object.keys(after)){
            if (after[key] !== before[key]) {
                changed[key] = after[key];
                isChanged = true;
            }
        }
    }
    return isChanged ? changed : undefined;
};
const cleanupYogaNode = (node)=>{
    node?.unsetMeasureFunc();
    node?.freeRecursive();
};
function createInkReconciler(callback) {
    return createReconciler({
        getRootHostContext: ()=>({
                isInsideText: false
            }),
        prepareForCommit: ()=>null,
        preparePortalMount: ()=>null,
        clearContainer: ()=>false,
        resetAfterCommit (rootNode) {
            if (typeof rootNode.onComputeLayout === "function") {
                rootNode.onComputeLayout();
            }
            // Since renders are throttled at the instance level and <Static> component children
            // are rendered only once and then get deleted, we need an escape hatch to
            // trigger an immediate render to ensure <Static> children are written to output before they get erased
            if (rootNode.isStaticDirty) {
                rootNode.isStaticDirty = false;
                if (typeof rootNode.onImmediateRender === "function") {
                    rootNode.onImmediateRender();
                }
                return;
            }
            if (typeof rootNode.onRender === "function") {
                rootNode.onRender();
            }
        },
        getChildHostContext (parentHostContext, type) {
            const previousIsInsideText = parentHostContext.isInsideText;
            const isInsideText = type === "ink-text" || type === "ink-virtual-text";
            if (previousIsInsideText === isInsideText) {
                return parentHostContext;
            }
            return {
                isInsideText
            };
        },
        shouldSetTextContent: ()=>false,
        createInstance (originalType, newProps, _root, hostContext) {
            if (hostContext.isInsideText && originalType === "ink-box") {
                throw new Error(`<Box> can’t be nested inside <Text> component`);
            }
            const type = originalType === "ink-text" && hostContext.isInsideText ? "ink-virtual-text" : originalType;
            const node = createNode(type);
            for (const [key, value] of Object.entries(newProps)){
                if (key === "children") {
                    continue;
                }
                if (key === "style") {
                    setStyle(node, value);
                    if (node.yogaNode) {
                        styles(node.yogaNode, value);
                    }
                    continue;
                }
                if (key === "internal_transform") {
                    node.internal_transform = value;
                    continue;
                }
                if (key === "internal_static") {
                    node.internal_static = true;
                    continue;
                }
                setAttribute(node, key, value);
            }
            return node;
        },
        createTextInstance (text, _root, hostContext) {
            if (!hostContext.isInsideText) {
                throw new Error(`Text string "${text}" must be rendered inside <Text> component`);
            }
            return createTextNode(text);
        },
        resetTextContent () {},
        hideTextInstance (node) {
            setTextNodeValue(node, "");
        },
        unhideTextInstance (node, text) {
            setTextNodeValue(node, text);
        },
        getPublicInstance: (instance)=>instance,
        hideInstance (node) {
            node.yogaNode?.setDisplay(Yoga.DISPLAY_NONE);
        },
        unhideInstance (node) {
            node.yogaNode?.setDisplay(Yoga.DISPLAY_FLEX);
        },
        appendInitialChild: appendChildNode,
        appendChild: appendChildNode,
        insertBefore: insertBeforeNode,
        finalizeInitialChildren (node, _type, _props, rootNode) {
            if (node.internal_static) {
                rootNode.isStaticDirty = true;
                // Save reference to <Static> node to skip traversal of entire
                // node tree to find it
                rootNode.staticNode = node;
            }
            return false;
        },
        isPrimaryRenderer: true,
        supportsMutation: true,
        supportsPersistence: false,
        supportsHydration: false,
        scheduleTimeout: setTimeout,
        cancelTimeout: clearTimeout,
        noTimeout: -1,
        getCurrentEventPriority: ()=>DefaultEventPriority,
        beforeActiveInstanceBlur () {},
        afterActiveInstanceBlur () {},
        detachDeletedInstance () {},
        getInstanceFromNode: ()=>null,
        prepareScopeUpdate () {},
        getInstanceFromScope: ()=>null,
        appendChildToContainer: appendChildNode,
        insertInContainerBefore: insertBeforeNode,
        removeChildFromContainer (node, removeNode) {
            removeChildNode(node, removeNode);
            cleanupYogaNode(removeNode.yogaNode);
        },
        prepareUpdate (node, _type, oldProps, newProps, rootNode) {
            if (node.internal_static) {
                rootNode.isStaticDirty = true;
            }
            const props = diff(oldProps, newProps);
            const style = diff(oldProps["style"], newProps["style"]);
            if (!props && !style) {
                return null;
            }
            return {
                props,
                style
            };
        },
        commitUpdate (node, { props, style }) {
            if (props) {
                for (const [key, value] of Object.entries(props)){
                    if (key === "style") {
                        setStyle(node, value);
                        continue;
                    }
                    if (key === "internal_transform") {
                        node.internal_transform = value;
                        continue;
                    }
                    if (key === "internal_static") {
                        node.internal_static = true;
                        continue;
                    }
                    setAttribute(node, key, value);
                }
            }
            if (style && node.yogaNode) {
                styles(node.yogaNode, style);
            }
            callback();
        },
        commitTextUpdate (node, _oldText, newText) {
            setTextNodeValue(node, newText);
            callback();
        },
        removeChild (node, removeNode) {
            removeChildNode(node, removeNode);
            cleanupYogaNode(removeNode.yogaNode);
        }
    });
}

class Output {
    width;
    height;
    operations = [];
    constructor(options){
        const { width, height } = options;
        this.width = width;
        this.height = height;
    }
    write(x, y, text, options) {
        const { transformers } = options;
        if (!text) {
            return;
        }
        this.operations.push({
            type: "write",
            x,
            y,
            text,
            transformers
        });
    }
    clip(clip) {
        this.operations.push({
            type: "clip",
            clip
        });
    }
    unclip() {
        this.operations.push({
            type: "unclip"
        });
    }
    get() {
        // Initialize output array with a specific set of rows, so that margin/padding at the bottom is preserved
        const output = [];
        for(let y = 0; y < this.height; y++){
            const row = [];
            for(let x = 0; x < this.width; x++){
                row.push({
                    type: "char",
                    value: " ",
                    fullWidth: false,
                    styles: []
                });
            }
            output.push(row);
        }
        const clips = [];
        for (const operation of this.operations){
            if (operation.type === "clip") {
                clips.push(operation.clip);
            }
            if (operation.type === "unclip") {
                clips.pop();
            }
            if (operation.type === "write") {
                const { text, transformers } = operation;
                let { x, y } = operation;
                let lines = text.split("\n");
                const clip = clips[clips.length - 1];
                if (clip) {
                    const clipHorizontally = typeof clip?.x1 === "number" && typeof clip?.x2 === "number";
                    const clipVertically = typeof clip?.y1 === "number" && typeof clip?.y2 === "number";
                    // If text is positioned outside of clipping area altogether,
                    // skip to the next operation to avoid unnecessary calculations
                    if (clipHorizontally) {
                        const width = widestLine(text);
                        if (x + width < clip.x1 || x > clip.x2) {
                            continue;
                        }
                    }
                    if (clipVertically) {
                        const height = lines.length;
                        if (y + height < clip.y1 || y > clip.y2) {
                            continue;
                        }
                    }
                    if (clipHorizontally) {
                        lines = lines.map((line)=>{
                            const from = x < clip.x1 ? clip.x1 - x : 0;
                            const width = stringWidth(line);
                            const to = x + width > clip.x2 ? clip.x2 - x : width;
                            return sliceAnsi(line, from, to);
                        });
                        if (x < clip.x1) {
                            x = clip.x1;
                        }
                    }
                    if (clipVertically) {
                        const from = y < clip.y1 ? clip.y1 - y : 0;
                        const height = lines.length;
                        const to = y + height > clip.y2 ? clip.y2 - y : height;
                        lines = lines.slice(from, to);
                        if (y < clip.y1) {
                            y = clip.y1;
                        }
                    }
                }
                let offsetY = 0;
                // eslint-disable-next-line prefer-const
                for (let [index, line] of lines.entries()){
                    const currentLine = output[y + offsetY];
                    // Line can be missing if `text` is taller than height of pre-initialized `this.output`
                    if (!currentLine) {
                        continue;
                    }
                    for (const transformer of transformers){
                        line = transformer(line, index);
                    }
                    const characters = styledCharsFromTokens(tokenize(line));
                    let offsetX = x;
                    for (const character of characters){
                        currentLine[offsetX] = character;
                        // Some characters take up more than one column. In that case, the following
                        // pixels need to be cleared to avoid printing extra characters
                        const isWideCharacter = character.fullWidth || character.value.length > 1;
                        if (isWideCharacter) {
                            currentLine[offsetX + 1] = {
                                type: "char",
                                value: "",
                                fullWidth: false,
                                styles: character.styles
                            };
                        }
                        offsetX += isWideCharacter ? 2 : 1;
                    }
                    offsetY++;
                }
            }
        }
        const generatedOutput = output.map((line)=>{
            // See https://github.com/vadimdemedes/ink/pull/564#issuecomment-1637022742
            const lineWithoutEmptyItems = line.filter((item)=>item !== undefined);
            return styledCharsToString(lineWithoutEmptyItems).trimEnd();
        }).join("\n");
        return {
            output: generatedOutput,
            height: output.length
        };
    }
}

function getMaxWidth(yogaNode) {
    return yogaNode.getComputedWidth() - yogaNode.getComputedPadding(Yoga.EDGE_LEFT) - yogaNode.getComputedPadding(Yoga.EDGE_RIGHT) - yogaNode.getComputedBorder(Yoga.EDGE_LEFT) - yogaNode.getComputedBorder(Yoga.EDGE_RIGHT);
}

const renderBorder = (x, y, node, output)=>{
    if (node.style.borderStyle) {
        const width = node.yogaNode.getComputedWidth();
        const height = node.yogaNode.getComputedHeight();
        const box = typeof node.style.borderStyle === "string" ? cliBoxes[node.style.borderStyle] : node.style.borderStyle;
        const topBorderColor = node.style.borderTopColor ?? node.style.borderColor;
        const bottomBorderColor = node.style.borderBottomColor ?? node.style.borderColor;
        const leftBorderColor = node.style.borderLeftColor ?? node.style.borderColor;
        const rightBorderColor = node.style.borderRightColor ?? node.style.borderColor;
        const dimTopBorderColor = node.style.borderTopDimColor ?? node.style.borderDimColor;
        const dimBottomBorderColor = node.style.borderBottomDimColor ?? node.style.borderDimColor;
        const dimLeftBorderColor = node.style.borderLeftDimColor ?? node.style.borderDimColor;
        const dimRightBorderColor = node.style.borderRightDimColor ?? node.style.borderDimColor;
        const showTopBorder = node.style.borderTop !== false;
        const showBottomBorder = node.style.borderBottom !== false;
        const showLeftBorder = node.style.borderLeft !== false;
        const showRightBorder = node.style.borderRight !== false;
        const contentWidth = width - (showLeftBorder ? 1 : 0) - (showRightBorder ? 1 : 0);
        let topBorder = showTopBorder ? colorize((showLeftBorder ? box.topLeft : "") + box.top.repeat(contentWidth) + (showRightBorder ? box.topRight : ""), topBorderColor, "foreground") : undefined;
        if (showTopBorder && dimTopBorderColor) {
            topBorder = chalk.dim(topBorder);
        }
        let verticalBorderHeight = height;
        if (showTopBorder) {
            verticalBorderHeight -= 1;
        }
        if (showBottomBorder) {
            verticalBorderHeight -= 1;
        }
        let leftBorder = `${colorize(box.left, leftBorderColor, "foreground")}\n`.repeat(verticalBorderHeight);
        if (dimLeftBorderColor) {
            leftBorder = chalk.dim(leftBorder);
        }
        let rightBorder = `${colorize(box.right, rightBorderColor, "foreground")}\n`.repeat(verticalBorderHeight);
        if (dimRightBorderColor) {
            rightBorder = chalk.dim(rightBorder);
        }
        let bottomBorder = showBottomBorder ? colorize((showLeftBorder ? box.bottomLeft : "") + box.bottom.repeat(contentWidth) + (showRightBorder ? box.bottomRight : ""), bottomBorderColor, "foreground") : undefined;
        if (showBottomBorder && dimBottomBorderColor) {
            bottomBorder = chalk.dim(bottomBorder);
        }
        const offsetY = showTopBorder ? 1 : 0;
        if (topBorder) {
            output.write(x, y, topBorder, {
                transformers: []
            });
        }
        if (showLeftBorder) {
            output.write(x, y + offsetY, leftBorder, {
                transformers: []
            });
        }
        if (showRightBorder) {
            output.write(x + width - 1, y + offsetY, rightBorder, {
                transformers: []
            });
        }
        if (bottomBorder) {
            output.write(x, y + height - 1, bottomBorder, {
                transformers: []
            });
        }
    }
};

// If parent container is `<Box>`, text nodes will be treated as separate nodes in
// the tree and will have their own coordinates in the layout.
// To ensure text nodes are aligned correctly, take X and Y of the first text node
// and use it as offset for the rest of the nodes
// Only first node is taken into account, because other text nodes can't have margin or padding,
// so their coordinates will be relative to the first node anyway
const applyPaddingToText = (node, text)=>{
    const yogaNode = node.childNodes[0]?.yogaNode;
    if (yogaNode) {
        const offsetX = yogaNode.getComputedLeft();
        const offsetY = yogaNode.getComputedTop();
        text = "\n".repeat(offsetY) + indentString(text, offsetX);
    }
    return text;
};
// After nodes are laid out, render each to output object, which later gets rendered to terminal
const renderNodeToOutput = (node, output, options)=>{
    const { offsetX = 0, offsetY = 0, transformers = [], skipStaticElements } = options;
    if (skipStaticElements && node.internal_static) {
        return;
    }
    const { yogaNode } = node;
    if (yogaNode) {
        if (yogaNode.getDisplay() === Yoga.DISPLAY_NONE) {
            return;
        }
        // Left and top positions in Yoga are relative to their parent node
        const x = offsetX + yogaNode.getComputedLeft();
        const y = offsetY + yogaNode.getComputedTop();
        // Transformers are functions that transform final text output of each component
        // See Output class for logic that applies transformers
        let newTransformers = transformers;
        if (typeof node.internal_transform === "function") {
            newTransformers = [
                node.internal_transform,
                ...transformers
            ];
        }
        if (node.nodeName === "ink-text") {
            let text = squashTextNodes(node);
            if (text.length > 0) {
                const currentWidth = widestLine(text);
                const maxWidth = getMaxWidth(yogaNode);
                if (currentWidth > maxWidth) {
                    const textWrap = node.style.textWrap ?? "wrap";
                    text = wrapText(text, maxWidth, textWrap);
                }
                text = applyPaddingToText(node, text);
                output.write(x, y, text, {
                    transformers: newTransformers
                });
            }
            return;
        }
        let clipped = false;
        if (node.nodeName === "ink-box") {
            renderBorder(x, y, node, output);
            const clipHorizontally = node.style.overflowX === "hidden" || node.style.overflow === "hidden";
            const clipVertically = node.style.overflowY === "hidden" || node.style.overflow === "hidden";
            if (clipHorizontally || clipVertically) {
                const x1 = clipHorizontally ? x + yogaNode.getComputedBorder(Yoga.EDGE_LEFT) : undefined;
                const x2 = clipHorizontally ? x + yogaNode.getComputedWidth() - yogaNode.getComputedBorder(Yoga.EDGE_RIGHT) : undefined;
                const y1 = clipVertically ? y + yogaNode.getComputedBorder(Yoga.EDGE_TOP) : undefined;
                const y2 = clipVertically ? y + yogaNode.getComputedHeight() - yogaNode.getComputedBorder(Yoga.EDGE_BOTTOM) : undefined;
                output.clip({
                    x1,
                    x2,
                    y1,
                    y2
                });
                clipped = true;
            }
        }
        if (node.nodeName === "ink-root" || node.nodeName === "ink-box") {
            for (const childNode of node.childNodes){
                renderNodeToOutput(childNode, output, {
                    offsetX: x,
                    offsetY: y,
                    transformers: newTransformers,
                    skipStaticElements
                });
            }
            if (clipped) {
                output.unclip();
            }
        }
    }
};

const renderer = (node)=>{
    if (node.yogaNode) {
        const output = new Output({
            width: node.yogaNode.getComputedWidth(),
            height: node.yogaNode.getComputedHeight()
        });
        renderNodeToOutput(node, output, {
            skipStaticElements: true
        });
        let { output: generatedOutput } = output.get();
        let staticOutput;
        if (node.staticNode?.yogaNode) {
            staticOutput = new Output({
                width: node.staticNode.yogaNode.getComputedWidth(),
                height: node.staticNode.yogaNode.getComputedHeight()
            });
            renderNodeToOutput(node.staticNode, staticOutput, {
                skipStaticElements: false
            });
        }
        if (staticOutput) {
            generatedOutput = `${staticOutput.get().output}\n${generatedOutput}`;
        }
        return generatedOutput;
    }
    return "";
};

const masks = new Set();
const getMasks = ()=>Array.from(masks);
const maskValue = "****";
const maskString = (value)=>{
    let str = `${value}`;
    getMasks().forEach((item)=>{
        str = str.replaceAll(`${item}`, maskValue);
    });
    return str;
};
const setMask = (value)=>{
    if (Array.isArray(value)) {
        value.filter(Boolean).forEach((item)=>setMask(item));
        return;
    }
    masks.add(value);
};
/** Console.log monkey patch */ (function() {
    function sanitize(input, padding = 0, seen = new Set()) {
        if (typeof input === "string" || typeof input === "number") {
            return /*#__PURE__*/ React.createElement(Text, null, maskString(input));
        }
        if (typeof input === "boolean") {
            return /*#__PURE__*/ React.createElement(Text, {
                bold: true,
                color: input ? "green" : "red"
            }, input.toString());
        }
        if (typeof input === "symbol") {
            return /*#__PURE__*/ React.createElement(Text, {
                bold: true
            }, "Symbol");
        }
        if (typeof input === "function") {
            return /*#__PURE__*/ React.createElement(Text, {
                bold: true
            }, "Function");
        }
        if (typeof input === null) {
            return /*#__PURE__*/ React.createElement(Text, {
                bold: true
            }, "null");
        }
        if (typeof input === undefined) {
            return /*#__PURE__*/ React.createElement(Text, {
                bold: true
            }, "undefined");
        }
        if (typeof input === "object" && input !== null) {
            if (seen.has(input)) {
                return /*#__PURE__*/ React.createElement(Text, {
                    bold: true
                }, "[[Circular Reference]]");
            }
            seen.add(input);
            return /*#__PURE__*/ React.createElement(Fragment, null, /*#__PURE__*/ React.createElement(Text, {
                bold: true
            }, "Object", JSON.stringify(input)), Object.keys(input).map((key, index)=>{
                return /*#__PURE__*/ React.createElement(Fragment, {
                    key: index
                }, /*#__PURE__*/ React.createElement(Text, null, "\n", "  ".repeat(padding + 1), maskString(key), ":", " "), sanitize(input[key], padding + 1, seen));
            }));
        }
        return /*#__PURE__*/ React.createElement(Text, {
            bold: true
        }, typeof input);
    }
    const render = (Element)=>{
        forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED(Element);
    };
    console.log = function() {
        const args = Array.prototype.slice.call(arguments).map((input)=>sanitize(input));
        render(/*#__PURE__*/ React.createElement(Log, null, args));
    // Additional logic or modification here...
    };
    console.error = function() {
        const args = Array.prototype.slice.call(arguments).map((input)=>sanitize(input));
        render(/*#__PURE__*/ React.createElement(Error$1, null, args));
    };
    console.info = function() {
        const args = Array.prototype.slice.call(arguments).map((input)=>sanitize(input));
        render(/*#__PURE__*/ React.createElement(Info, null, args));
    };
    console.trace = function() {
        const args = Array.prototype.slice.call(arguments).map((input)=>sanitize(input));
        render(/*#__PURE__*/ React.createElement(Info, null, args));
    };
    console.warn = function() {
        const args = Array.prototype.slice.call(arguments).map((input)=>sanitize(input));
        render(/*#__PURE__*/ React.createElement(Info, null, args));
    };
    console.assert = function() {
        const args = Array.prototype.slice.call(arguments).map((input)=>sanitize(input));
        render(/*#__PURE__*/ React.createElement(Info, null, args));
    };
})();
(function() {
    const OriginalError = Error;
    class PipesError extends OriginalError {
        #name;
        constructor(message, options){
            super(message, options);
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, PipesError);
            }
            this.#name = "Error";
        }
        toString() {
            const message = super.toString();
            return maskString(message);
        }
    }
    Error = PipesError;
})();

const _RENDER_STATE = {
    force_stop: false
};
const haltAllRender = ()=>{
    _RENDER_STATE.force_stop = true;
};
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stderr.write.bind(process.stderr);
class WriteTo {
    static #locked = false;
    static #lockPromises = [];
    static #newLockPromise = ()=>{
        const value = new Promise((resolve)=>{
            this.#lockPromises.push(resolve);
        });
        return value;
    };
    static #getFirstResolve = ()=>{
        const val = this.#lockPromises.shift();
        return val;
    };
    static async lock(fn) {
        if (this.#locked) {
            await this.#newLockPromise();
        }
        this.#locked = true;
        try {
            await fn(this.#write);
        } finally{
            const val = this.#getFirstResolve();
            if (val) {
                val();
            } else {
                this.#locked = false;
            }
        }
    }
    static write(value, encodingOrCb, _cb) {
        const cb = typeof encodingOrCb === "function" ? encodingOrCb : _cb;
        const encoding = typeof encodingOrCb !== "function" ? encodingOrCb : undefined;
        void WriteTo.lock((write)=>{
            return write(value, encoding);
        }).then(()=>{
            if (cb) {
                cb();
            }
        }).catch((e)=>{
            if (cb) {
                cb(e);
            }
        });
        return true;
    }
    static #write(msg, encoding) {
        return new Promise((resolve)=>{
            if (_RENDER_STATE.force_stop) {
                resolve();
                return;
            }
            const _msg = typeof msg === "string" ? msg : Buffer.from(msg).toString(encoding);
            originalStdoutWrite(maskString(_msg), ()=>{
                resolve();
                return;
            });
        });
    }
}
process.stdout.write = WriteTo.write;

const isCi = ciinfo.isCI;
const noop = ()=>{};
const _THROTTLE_MS = 500;
class Ink {
    toString;
    // Ignore last render after unmounting a tree to prevent empty output before exit
    #isUnmounted;
    #container;
    #rootNode;
    #_renderCB;
    #renderCB;
    #rec;
    #unsubscribeResize;
    constructor(toString){
        this.toString = toString;
        this.#_renderCB = ()=>{};
        this.#renderCB = ()=>{
            this.#_renderCB();
        };
        this.#rec = createInkReconciler(this.#renderCB);
        this.resized = ()=>{
            this.calculateLayout();
        };
        this.#autorunDispenser = null;
        this.prevValues = "";
        this.calculateLayout = ()=>{
            // The 'columns' property can be undefined or 0 when not using a TTY.
            // In that case we fall back to 80.
            const terminalWidth = getScreenWidth();
            this.#rootNode.yogaNode.setWidth(terminalWidth);
            this.#rootNode.yogaNode.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);
        };
        autoBind(this);
        this.#rootNode = createNode("ink-root");
        this.#rootNode.onComputeLayout = this.calculateLayout;
        // Ignore last render after unmounting a tree to prevent empty output before exit
        this.#isUnmounted = false;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.#container = this.#rec.createContainer(this.#rootNode, // Legacy mode
        0, null, false, null, "id", ()=>{}, null);
        if (!isCi) {
            process$1.stdout.on("resize", this.resized);
            this.#unsubscribeResize = ()=>{
                process$1.stdout.off("resize", this.resized);
            };
        }
    }
    resized;
    #autorunDispenser;
    #getRenderedOutput() {
        return renderer(this.#rootNode);
    }
    prevValues;
    #setupAutorun(fn) {
        if (this.#autorunDispenser) {
            this.#autorunDispenser();
        }
        const updateStore = observable({
            value: ""
        });
        const forceUpdate = ()=>runInAction(()=>{
                updateStore.value = this.#getRenderedOutput();
            });
        this.#_renderCB = forceUpdate;
        const update = throttle(async (value)=>{
            if (this.#isUnmounted) {
                return;
            }
            if (value !== this.prevValues) {
                this.prevValues = value;
                if (!this.toString) {
                    await WriteTo.lock((write)=>{
                        return write(`\n${value}`);
                    });
                }
            }
        }, _THROTTLE_MS, {
            leading: true,
            trailing: true
        });
        this.#autorunDispenser = autorun(async ()=>{
            updateStore.value;
            const nodeValue = await (()=>{
                if (typeof fn === "function") {
                    return fn();
                }
                return fn;
            })();
            const node = /*#__PURE__*/ React.createElement(App, null, nodeValue);
            this.#rec.updateContainer(node, this.#container, null, noop);
            const value = this.#getRenderedOutput();
            await update(value);
        });
    }
    calculateLayout;
    _nonAsyncRender(node) {
        this.#rec.updateContainer(node, this.#container, null, noop);
        const value = this.#getRenderedOutput();
        process$1.stdout.write(`\n${value}`);
    }
    async render(node, now = false) {
        if (now) {
            const x = await (typeof node === "function" ? node() : node);
            this.#rec.updateContainer(x, this.#container, null, noop);
            const value = this.#getRenderedOutput();
            if (!this.toString) {
                await WriteTo.lock((write)=>{
                    return write(`\n${value}`);
                });
            }
            return;
        }
        if (this.#autorunDispenser) {
            const x = await (typeof node === "function" ? node() : node);
            this.#rec.updateContainer(x, this.#container, null, noop);
            return;
        }
        this.#setupAutorun(node);
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    unmount(_error) {
        if (this.#isUnmounted) {
            return;
        }
        this.calculateLayout();
        if (this.#autorunDispenser) {
            this.#autorunDispenser();
        }
        if (typeof this.#unsubscribeResize === "function") {
            this.#unsubscribeResize();
        }
        this.#isUnmounted = true;
        this.#rec.updateContainer(null, this.#container, null, noop);
    }
}

/**
 * Mount a component and render the output.
 */ const render = async (node, props = {})=>{
    const instance = new Ink(props.renderAsString ?? false);
    await instance.render(node, props.forceRenderNow ?? false);
    return {
        stop: async ()=>{
            await instance.render(node);
            instance.unmount();
        },
        value: ()=>instance.prevValues
    };
};
const forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED = (node)=>{
    const instance = new Ink(false);
    instance._nonAsyncRender(node);
};

/// <reference path="../global.d.ts" />
/**
 * Transform a string representation of React components before they are written to output.
 * For example, you might want to apply a gradient to text, add a clickable link or create some text effects.
 * These use cases can't accept React nodes as input, they are expecting a string.
 * That's what <Transform> component does,
 * it gives you an output string of its child components and lets you transform it in any way.
 */ function Transform({ children, transform }) {
    if (children === undefined || children === null) {
        return null;
    }
    return /*#__PURE__*/ React.createElement("ink-text", {
        style: {
            flexGrow: 0,
            flexShrink: 1,
            flexDirection: "row"
        },
        internal_transform: transform
    }, children);
}

const Badge = (props)=>{
    const type = props.display ?? "ansi";
    return renderBadge[type]({
        type: "Badge",
        ...props
    });
};
const renderBadge = {
    ansi: (component)=>{
        const val = component.children.trim().split("")[0] ?? "X";
        return /*#__PURE__*/ React.createElement(Box, {
            height: 1,
            marginLeft: 1,
            marginRight: 1,
            width: 4
        }, /*#__PURE__*/ React.createElement(Text, {
            wrap: "truncate",
            bold: true,
            color: component.color,
            backgroundColor: component.backgroundColor
        }, "[", val, "]"));
    },
    markdown: (_component)=>{
        throw new Error("Not implemented");
    }
};

const Container = (props)=>{
    return renderContainer.ansi({
        type: "Container",
        ...props
    });
};
const renderContainer = {
    ansi: (component)=>{
        const color = component.color ?? undefined;
        return /*#__PURE__*/ React.createElement(Box, {
            borderColor: color,
            alignSelf: "center",
            paddingLeft: component.padding ?? 0,
            paddingRight: component.padding ?? 0
        }, component.children);
    },
    markdown: (_component)=>{
        throw new Error("Not implemented");
    }
};

const Row = (props)=>{
    const type = props.display ?? "ansi";
    return renderRow[type]({
        type: "Row",
        ...props
    });
};
const renderRow = {
    ansi: (component)=>{
        const color = component.color ?? "gray";
        const children = Array.isArray(component.children) ? component.children : [
            component.children
        ];
        const widths = Array(children.length).fill(0).map((_e)=>{
            return `${Math.floor(100 / children.length)}%`;
        });
        return /*#__PURE__*/ React.createElement(Box, {
            flexDirection: "row",
            width: "100%",
            borderTop: false,
            borderBottom: false,
            borderLeft: false,
            borderRight: false,
            borderStyle: "single",
            borderColor: color,
            borderDimColor: true
        }, children.map((e, index)=>{
            const child = typeof e === "string" ? /*#__PURE__*/ React.createElement(Text, null, e) : e;
            return /*#__PURE__*/ React.createElement(Box, {
                key: index,
                alignSelf: "flex-start",
                paddingLeft: 1,
                paddingRight: 1,
                width: widths[index]
            }, child);
        }));
    },
    markdown: (_component)=>{
        throw new Error("Not implemented");
    }
};

const Subtitle = (props)=>{
    const type = props.display ?? "ansi";
    return renderSubtitle[type]({
        type: "Subtitle",
        ...props
    });
};
const renderSubtitle = {
    ansi: (component)=>{
        const color = component.color ?? "blue";
        const label = component.emoji ? /*#__PURE__*/ React.createElement(Badge, {
            color: "white",
            backgroundColor: color
        }, component.emoji) : /*#__PURE__*/ React.createElement(React.Fragment, null);
        return /*#__PURE__*/ React.createElement(Container, {
            color: color
        }, label, /*#__PURE__*/ React.createElement(Text, {
            backgroundColor: color,
            color: "white",
            bold: true
        }, " ".repeat(2), component.children.toUpperCase(), " ".repeat(2)));
    },
    markdown: (component)=>{
        throw new Error("Not implemented");
    }
};

const Dialog = (props)=>{
    const emojiType = {
        default: "",
        error: "X",
        success: "✔",
        failure: "!"
    }[props.dialogType ?? "default"];
    const borderColor = {
        default: "blue",
        error: "red",
        success: "green",
        failure: "red"
    }[props.dialogType ?? "default"];
    const allIsString = React.Children.toArray(props.children).every((e)=>typeof e === "string" || typeof e === "number");
    let children = React.Children.map(React.Children.toArray(props.children), (e)=>{
        if (allIsString) {
            return e;
        }
        if (typeof e === "string" || typeof e === "number") {
            return /*#__PURE__*/ React.createElement(Text, null, `${e}`.trim());
        }
        return e;
    });
    if (allIsString) {
        children = [
            /*#__PURE__*/ React.createElement(Text, {
                key: "text"
            }, children.join(""))
        ];
    }
    if (children.length === 0) {
        return /*#__PURE__*/ React.createElement(React.Fragment, null);
    }
    return /*#__PURE__*/ React.createElement(Row, null, typeof props.dialogType === "string" && props.dialogType !== "default" ? /*#__PURE__*/ React.createElement(Subtitle, {
        color: borderColor,
        emoji: emojiType
    }, props.title) : /*#__PURE__*/ React.createElement(Container, null, /*#__PURE__*/ React.createElement(React.Fragment, null)), /*#__PURE__*/ React.createElement(Container, null, children));
};

const Divider = (_props)=>{
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return RenderDivider();
};
const RenderDivider = ()=>{
    const totalWidths = getScreenWidth();
    return /*#__PURE__*/ React.createElement(Box, {
        width: totalWidths,
        minWidth: totalWidths,
        height: 1,
        borderTop: false,
        borderLeft: false,
        borderRight: false,
        borderBottom: true,
        borderStyle: "single"
    });
};

const Error$1 = (props)=>{
    return renderError.ansi({
        type: "Error",
        ...props
    });
};
const renderError = {
    ansi: (component)=>{
        return /*#__PURE__*/ React.createElement(Dialog, {
            title: component.title ?? "Error",
            dialogType: "error"
        }, component.children);
    },
    markdown: (_component)=>{
        throw "Not implemented";
    }
};

const Failure = (props)=>{
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return renderFailure.ansi({
        type: "Failure",
        ...props
    });
};
const renderFailure = {
    ansi: (component)=>{
        return /*#__PURE__*/ React.createElement(Dialog, {
            title: component.title ?? "Failure",
            dialogType: "failure"
        }, component.children);
    },
    markdown: (_component)=>{
        throw new Error(`Not implemented`);
    }
};

const CMD_STRING = "::";
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return "";
    } else if (typeof input === "string" || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
function escapeData(s) {
    return toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function escapeProperty(s) {
    return toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
}
class Command {
    command;
    message;
    properties;
    constructor(command, properties, message){
        if (!command) {
            command = "missing.command";
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += " ";
            let first = true;
            for(const key in this.properties){
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        } else {
                            cmdStr += ",";
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}

const Group = (props)=>{
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return renderGroup.ansi({
        type: "Group",
        ...props
    });
};
const renderGroup = {
    ansi: (component)=>{
        if (React.Children.toArray(component.children).length === 0) {
            return /*#__PURE__*/ React.createElement(React.Fragment, null);
        }
        if (ciinfo.GITHUB_ACTIONS) {
            const startGroup = new Command("group", {}, component.title).toString();
            const endGroup = new Command("endgroup", {}, "").toString();
            return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(Text, null, startGroup), component.children, /*#__PURE__*/ React.createElement(Text, null, endGroup));
        }
        return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(Box, {
            width: "100%",
            alignItems: "flex-end"
        }, /*#__PURE__*/ React.createElement(Text, {
            color: "white",
            underline: true
        }, component.title.trim())), component.children);
    },
    markdown: (component, _width)=>{
        return component.children;
    }
};

const Info = (props)=>{
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return renderInfo({
        type: "Info",
        ...props
    });
};
const renderInfo = (props)=>{
    return /*#__PURE__*/ React.createElement(Dialog, {
        title: props.title ?? "Info"
    }, props.children);
};

const Link = ({ url, children })=>{
    return /*#__PURE__*/ React.createElement(Transform, {
        transform: (children)=>terminalLink(children, url, {
                fallback: true
            })
    }, /*#__PURE__*/ React.createElement(Text, null, children));
};

const List = (props)=>{
    return /*#__PURE__*/ React.createElement(Container, {
        padding: 2
    }, props.children);
};
const ListItem = (props)=>{
    const child = [
        "string",
        "number"
    ].includes(typeof props.children) ? /*#__PURE__*/ React.createElement(Text, null, props.children) : props.children;
    return /*#__PURE__*/ React.createElement(Box, {
        width: "100%",
        flexDirection: "row"
    }, /*#__PURE__*/ React.createElement(Text, null, "- "), child);
};

const Log = (props)=>{
    return /*#__PURE__*/ React.createElement(Box, {
        width: "100%",
        flexDirection: "row"
    }, /*#__PURE__*/ React.createElement(Text, null, props.children));
};

const Success = (props)=>{
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return renderSuccess.ansi({
        type: "Success",
        ...props
    });
};
const renderSuccess = {
    ansi: (component)=>{
        return /*#__PURE__*/ React.createElement(Dialog, {
            dialogType: "success",
            title: component.title ?? "Success"
        }, component.children);
    },
    markdown: (_component)=>{
        throw new Error("Not implemented");
    }
};

const SpaceText = ({ children, ...props })=>{
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(Text, null, " "), /*#__PURE__*/ React.createElement(Text, props, children));
};
const Timestamp = (props)=>{
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return renderTimestamp.ansi({
        type: "Timestamp",
        ...props
    });
};
const invalidTime = /*#__PURE__*/ React.createElement(SpaceText, {
    color: "red"
}, "Invalid date");
const invalidDateFormat = /*#__PURE__*/ React.createElement(SpaceText, {
    color: "red"
}, "Invalid date format");
const renderTimestamp = {
    ansi: (component)=>{
        let date;
        if (component.time) {
            if (typeof component.time === "string" || typeof component.time === "number") {
                date = new Date(component.time);
            } else {
                date = component.time;
            }
        } else {
            date = new Date();
        }
        if (isNaN(date.getTime())) {
            return invalidTime;
        }
        const format = component.format || "ISO";
        let formattedDate;
        switch(format){
            case "ISO":
                formattedDate = date.toISOString();
                break;
            case "European":
                formattedDate = formatDate(date, "PPpp", {
                    locale: enGB
                });
                break;
            case "American":
                formattedDate = formatDate(date, "PPpp", {
                    locale: enUS
                });
                break;
            default:
                try {
                    formattedDate = formatDate(date, format);
                } catch (e) {
                    return invalidDateFormat;
                }
        }
        return /*#__PURE__*/ React.createElement(SpaceText, {
            color: "white",
            backgroundColor: "blue"
        }, formattedDate);
    },
    markdown: (_component)=>{
        throw new Error("Not implemented");
    }
};

const Title = (props)=>{
    return /*#__PURE__*/ React.createElement(Box, {
        width: "100%",
        marginTop: 1,
        marginBottom: 1,
        alignItems: "center"
    }, /*#__PURE__*/ React.createElement(Text, null, props.children));
};

/* Table */ class Table extends React.Component {
    /* Config */ /**
   * Merges provided configuration with defaults.
   */ getConfig() {
        return {
            data: this.props.data,
            columns: this.props.columns || this.getDataKeys(),
            padding: this.props.padding || 2,
            header: this.props.header || Header,
            cell: this.props.cell || Cell,
            skeleton: this.props.skeleton || Skeleton
        };
    }
    /**
   * Gets all keyes used in data by traversing through the data.
   */ getDataKeys() {
        const keys = new Set();
        // Collect all the keys.
        for (const data of this.props.data){
            for(const key in data){
                keys.add(key);
            }
        }
        return Array.from(keys);
    }
    /**
   * Calculates the width of each column by finding
   * the longest value in a cell of a particular column.
   *
   * Returns a list of column names and their widths.
   */ getColumns() {
        const { columns, padding } = this.getConfig();
        const widths = columns.map((key)=>{
            const header = String(key).length;
            /* Get the width of each cell in the column */ const data = this.props.data.map((data)=>{
                const value = data[key];
                if (value == undefined || value == null) return 0;
                return String(value).length;
            });
            const width = Math.max(...data, header) + padding * 2;
            /* Construct a cell */ return {
                column: key,
                width: width,
                key: String(key)
            };
        });
        return widths;
    }
    /**
   * Returns a (data) row representing the headings.
   */ getHeadings() {
        const { columns } = this.getConfig();
        const headings = columns.reduce((acc, column)=>({
                ...acc,
                [column]: column
            }), {});
        return headings;
    }
    /* Rendering utilities */ // The top most line in the table.
    header = row({
        cell: this.getConfig().skeleton,
        padding: this.getConfig().padding,
        skeleton: {
            component: this.getConfig().skeleton,
            // chars
            line: "─",
            left: "┌",
            right: "┐",
            cross: "┬"
        }
    });
    // The line with column names.
    heading = row({
        cell: this.getConfig().header,
        padding: this.getConfig().padding,
        skeleton: {
            component: this.getConfig().skeleton,
            // chars
            line: " ",
            left: "│",
            right: "│",
            cross: "│"
        }
    });
    // The line that separates rows.
    separator = row({
        cell: this.getConfig().skeleton,
        padding: this.getConfig().padding,
        skeleton: {
            component: this.getConfig().skeleton,
            // chars
            line: "─",
            left: "├",
            right: "┤",
            cross: "┼"
        }
    });
    // The row with the data.
    data = row({
        cell: this.getConfig().cell,
        padding: this.getConfig().padding,
        skeleton: {
            component: this.getConfig().skeleton,
            // chars
            line: " ",
            left: "│",
            right: "│",
            cross: "│"
        }
    });
    // The bottom most line of the table.
    footer = row({
        cell: this.getConfig().skeleton,
        padding: this.getConfig().padding,
        skeleton: {
            component: this.getConfig().skeleton,
            // chars
            line: "─",
            left: "└",
            right: "┘",
            cross: "┴"
        }
    });
    /* Render */ render() {
        /* Data */ const columns = this.getColumns();
        const headings = this.getHeadings();
        /**
     * Render the table line by line.
     */ return /*#__PURE__*/ React.createElement(Box, {
            flexDirection: "column",
            width: "100%"
        }, this.header({
            key: "header",
            columns,
            data: {}
        }), this.heading({
            key: "heading",
            columns,
            data: headings
        }), this.props.data.map((row, index)=>{
            // Calculate the hash of the row based on its value and position
            const key = `row-${sha1(row)}-${index}`;
            // Construct a row.
            return /*#__PURE__*/ React.createElement(Box, {
                flexDirection: "column",
                key: key
            }, this.separator({
                key: `separator-${key}`,
                columns,
                data: {}
            }), this.data({
                key: `data-${key}`,
                columns,
                data: row
            }));
        }), this.footer({
            key: "footer",
            columns,
            data: {}
        }));
    }
}
/**
 * Constructs a Row element from the configuration.
 */ function row(config) {
    /* This is a component builder. We return a function. */ const skeleton = config.skeleton;
    /* Row */ return (props)=>/*#__PURE__*/ React.createElement(Box, {
            flexDirection: "row"
        }, /*#__PURE__*/ React.createElement(skeleton.component, null, skeleton.left), ...intersperse((i)=>{
            const key = `${props.key}-hseparator-${i}`;
            // The horizontal separator.
            return /*#__PURE__*/ React.createElement(skeleton.component, {
                key: key
            }, skeleton.cross);
        }, // Values.
        props.columns.map((column, colI)=>{
            // content
            const value = props.data[column.column];
            if (value == undefined || value == null) {
                const key = `${props.key}-empty-${column.key}`;
                return /*#__PURE__*/ React.createElement(config.cell, {
                    key: key,
                    column: colI
                }, skeleton.line.repeat(column.width));
            } else {
                const key = `${props.key}-cell-${column.key}`;
                // margins
                const ml = config.padding;
                const mr = column.width - String(value).length - config.padding;
                return /* prettier-ignore */ /*#__PURE__*/ React.createElement(config.cell, {
                    key: key,
                    column: colI
                }, `${skeleton.line.repeat(ml)}${String(value)}${skeleton.line.repeat(mr)}`);
            }
        })), /*#__PURE__*/ React.createElement(skeleton.component, null, skeleton.right));
}
/**
 * Renders the header of a table.
 */ function Header(props) {
    return /*#__PURE__*/ React.createElement(Text, {
        bold: true,
        color: "whiteBright"
    }, props.children);
}
/**
 * Renders a cell in the table.
 */ function Cell(props) {
    return /*#__PURE__*/ React.createElement(Text, null, props.children);
}
/**
 * Redners the scaffold of the table.
 */ function Skeleton(props) {
    return /*#__PURE__*/ React.createElement(Text, {
        dimColor: true,
        color: "gray"
    }, props.children);
}
/* Utility functions */ /**
 * Intersperses a list of elements with another element.
 */ function intersperse(intersperser, elements) {
    // Intersparse by reducing from left.
    const interspersed = elements.reduce((acc, element, index)=>{
        // Only add element if it's the first one.
        if (acc.length === 0) return [
            element
        ];
        // Add the intersparser as well otherwise.
        return [
            ...acc,
            intersperser(index),
            element
        ];
    }, []);
    return interspersed;
}

class DOMError extends Error {
    #message;
    constructor(pipeComponent){
        super("Pipes Error"); // Ensure that pipeComponent can be converted to a string
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DOMError);
        }
        this.name = this.constructor.name;
        this.#message = /*#__PURE__*/ React.createElement(React.Fragment, null, pipeComponent, /*#__PURE__*/ React.createElement(Error$1, null, this.stack));
    }
    get = ()=>{
        return this.#message;
    };
    toString = async ()=>{
        const value = await render(this.#message, {
            renderAsString: true
        });
        return value.value();
    };
}

var dom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Badge: Badge,
    Container: Container,
    DOMError: DOMError,
    Dialog: Dialog,
    Divider: Divider,
    Error: Error$1,
    Failure: Failure,
    Group: Group,
    Info: Info,
    Link: Link,
    List: List,
    ListItem: ListItem,
    Log: Log,
    Row: Row,
    Subtitle: Subtitle,
    Success: Success,
    Table: Table,
    Text: Text,
    Timestamp: Timestamp,
    Title: Title,
    haltAllRender: haltAllRender,
    render: render,
    setMask: setMask
});

function isErr(e) {
    return !!(typeof e === "object" && e instanceof Error);
}
function unknownToString(e) {
    if (e instanceof DOMError) {
        return e.get();
    }
    if (isErr(e)) {
        return `${e.message}\n${e.stack || ""}`;
    } else if (typeof e === "string") {
        return e;
    } else if (typeof e === "number" || typeof e === "boolean" || e === null) {
        return String(e);
    } else if (typeof e === "undefined") {
        return "Unknown Error";
    } else if (typeof e === "object") {
        if ("message" in e) {
            return JSON.stringify(e.message);
        }
        return JSON.stringify(e);
    } else if (e == null) {
        return "Unknown error";
    }
    return JSON.stringify(e);
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const throwJSXError = (context, config, errorMSG, shouldRender = true)=>{
    const { stack } = context;
    const { appName } = config;
    const jsxSTACK = stack.map((e, index)=>/*#__PURE__*/ React.createElement(Error$1, {
            key: index
        }, e));
    const jsx = /*#__PURE__*/ React.createElement(Container, null, /*#__PURE__*/ React.createElement(Error$1, null, "Error in context: ", appName), jsxSTACK, /*#__PURE__*/ React.createElement(Error$1, null, unknownToString(errorMSG)));
    if (shouldRender) {
        void render(()=>jsx, {
            forceRenderNow: true
        });
    }
    throw new DOMError(jsx);
};

const createPipesContextCommand = ({ value = undefined, output = voidType(), implement })=>{
    // Skip validating context and config
    const configSchema = custom();
    const contextSchema = custom();
    const _fn = (__fn)=>{
        if (value === undefined) {
            return functionType().args(contextSchema.describe("Context"), configSchema.describe("Config")).returns(output).implement(__fn);
        }
        return functionType().args(contextSchema.describe("Context"), configSchema.describe("Config"), value).returns(output).implement(__fn);
    };
    const __fn = _fn(implement);
    const fn = (...args)=>{
        try {
            return fn._fn(...args);
        } catch (e) {
            // args[0] is context
            // args[1] is config
            throwJSXError(args[0], args[1], e);
        }
    };
    const wrapper = (newFn)=>_fn(newFn);
    fn._wrapper = wrapper;
    fn._implement = _fn;
    fn._fn = __fn;
    fn._isPipesCommand = true;
    return fn;
};

function createModuleName(name) {
    return name;
}
function createConfig(fn) {
    return fn;
}
function createContext(fn) {
    return fn;
}
const _createModule = ({ name, config, context, required = [], optional = [] })=>{
    const fn = (props)=>createPipesContextCommand(props);
    return {
        name,
        config: config({
            z
        }),
        context: context({
            z,
            fn
        }),
        required: required.map((e)=>createModuleName(e)),
        optional: optional.map((e)=>createModuleName(e))
    };
};
// NOTICE: We reintroduce alot of typing here so modules can be safely isolated.
function createModule(param) {
    return _createModule(param);
}

const PipesCoreConfig = createConfig(({ z })=>({
        appName: z.string().default("pipes").describe("The name of the context"),
        env: z.union([
            z.literal("github"),
            z.literal("gitlab"),
            z.literal("local")
        ]).default(()=>{
            if (ciinfo.GITLAB) {
                return "gitlab";
            }
            if (ciinfo.GITHUB_ACTIONS) {
                return "github";
            }
            return "local";
        }).describe("The environment the code is running in"),
        isCI: z.boolean().default(ciinfo.isCI, {
            env: "ci",
            arg: {
                long: "isCI",
                short: "c"
            }
        }).describe("Is the current environment a CI environment"),
        isPR: z.boolean().default(ciinfo.isPR || false).describe("Is the current environment a PR environment")
    }));
const PipesCoreContext = createContext(({ z, fn })=>({
        startTime: z.date().default(new Date()),
        getDurationInMs: fn({
            output: z.number(),
            implement: (context)=>{
                const currentTime = new Date();
                return currentTime.getTime() - context.startTime.getTime();
            }
        }),
        addContextToCore: fn({
            implement: ()=>{
                throw new Error(`This should be overwritten`);
            }
        }),
        haltAll: fn({
            implement: ()=>{}
        }),
        addEnv: fn({
            output: z.custom(),
            value: z.object({
                container: z.custom(),
                env: z.array(z.tuple([
                    z.string(),
                    z.string()
                ]))
            }),
            implement: (_context, _config, { container, env })=>{
                let newContainer = container;
                for (const [key, value] of env){
                    newContainer = newContainer.withEnvVariable(key, value);
                }
                return newContainer;
            }
        }),
        modules: z.array(z.string()).default([]).describe("The modules to load"),
        stack: z.array(z.string()).default([]).describe("The caller stack"),
        imageStore: z.custom(()=>{
            return createGlobalZodKeyStore(z.custom((val)=>{
                if (val instanceof Container$1) {
                    return val;
                }
                throw new Error("Invalid value");
            }), "PIPES-IMAGE-STORE");
        }),
        client: z.custom((val)=>{
            if (val instanceof Client) {
                return val;
            }
            throw new Error("Provided client is not an instance of the expected Client class.");
        }),
        hasModule: fn({
            output: z.boolean(),
            value: z.string(),
            implement: (context, _config, value)=>{
                return context.modules.includes(value);
            }
        })
    }));
const PipesCore = createModule({
    name: "PipesCore",
    config: PipesCoreConfig,
    context: PipesCoreContext
});

/**
 * Represents the core class for contexts and modules.
 * @class
 */ class PipesCoreClass {
    /**
   * A private array to store scripts.
   * @private
   */ #scripts = [];
    #symbol;
    get symbol() {
        return this.#symbol;
    }
    #dependencies = new Set();
    addDependency(value) {
        if (value instanceof PipesCoreClass) {
            this.#dependencies.add(value.symbol);
            return this;
        }
        this.#dependencies.add(value);
        return this;
    }
    removeDependency(value) {
        if (value instanceof PipesCoreClass) {
            this.#dependencies.delete(value.symbol);
            return this;
        }
        this.#dependencies.add(value);
        return this;
    }
    /**
   * Adds a new script to the core.
   */ addScript(fn) {
        const _fn = async (context, config)=>{
            try {
                await fn(context, config);
            } catch (e) {
                throwJSXError(context, config, e);
            }
        };
        this.#scripts.push(_fn);
        return this;
    }
    #haltAll = ()=>{};
    set haltAll(value) {
        this.#haltAll = value;
    }
    get haltAll() {
        return this.#haltAll;
    }
    /**
   * Base core should inject this one.
   */ addContext = (_context, _config, _props)=>{
        throw new Error("This should be overwritten");
    };
    /**
   * Private state management related to the readiness and modules of the core.
   */ #internalStatesStore = {
        modules: [
            "PipesCoreModule"
        ],
        isReady: {
            state: "NOT_READY",
            reason: "Dagger Client has not been injected"
        }
    };
    #internalStates = new Proxy(this.#internalStatesStore, {
        set: (target, prop, value)=>{
            if (prop === "client") {
                if (value && value instanceof Client) {
                    target.client = value;
                    target.isReady.state = "READY";
                    delete target.isReady.reason;
                    return true;
                } else {
                    delete target.client;
                    target.isReady.state = "NOT_READY";
                    target.isReady.reason = "Dagger Client has not been injected";
                }
                return true;
            }
            return false;
        }
    });
    // Private Zod schemas to parse configurations and contexts.
    #configSchema;
    #contextSchema;
    // Public instances for config and context.
    config;
    context;
    constructor({ modules, schemas: { config, context } }){
        this.#internalStatesStore.modules = modules;
        this.#symbol = Symbol();
        this.#configSchema = config;
        this.#contextSchema = context;
        this.config = createZodStore(this.#configSchema);
        this.context = createZodStore(this.#contextSchema, [
            {
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ key: "addContextToCore",
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ get: ()=>{
                    return this.addContext;
                }
            },
            {
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ key: "imageStore",
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ get: ()=>{
                    return createGlobalZodKeyStore(custom((val)=>{
                        if (val instanceof Container$1) {
                            return val;
                        }
                        console.log(val);
                        throwJSXError(this.context, this.config, "Incorrect container");
                    }), "PIPES-IMAGE-STORE");
                }
            },
            {
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ key: "haltAll",
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ get: ()=>{
                    try {
                        return this.haltAll;
                    } catch (e) {
                        throwJSXError(this.context, this.config, e);
                    }
                }
            },
            {
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ key: "client",
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ get: ()=>{
                    try {
                        return this.client;
                    } catch (e) {
                        throwJSXError(this.context, this.config, e);
                    }
                }
            },
            {
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ key: "modules",
                /** @ts-expect-error - For simplification this is not hardcoded into the generic. */ get: ()=>{
                    try {
                        return this.modules;
                    } catch (e) {
                        throwJSXError(this.context, this.config, e);
                    }
                }
            }
        ]);
    }
    // Public getter to check if the core is ready.
    get isReady() {
        return this.#internalStates.isReady.state === "READY";
    }
    // Public getter to fetch the current modules.
    get modules() {
        return this.#internalStates.modules;
    }
    /**
   * Method to check if a specific module is present.
   */ hasModule(moduleName) {
        return this.modules.includes(moduleName);
    }
    /**
   * Method to add a new module to the core.
   */ addModule(module) {
        if (this.isReady) {
            throw new Error(`Cannot add module when in ready state`);
        }
        const requiredModules = module.required ?? [];
        for (const requiredModule of requiredModules){
            if (!this.hasModule(requiredModule)) {
                throw new Error(`Missing required module ${requiredModule}`);
            }
        }
        const newConfigSchema = {
            ...this.#configSchema,
            ...module.config
        };
        const newContextSchema = {
            ...this.#contextSchema,
            ...module.context
        };
        const modules = [
            ...this.modules,
            module.name
        ];
        return new PipesCoreClass({
            modules,
            schemas: {
                config: newConfigSchema,
                context: newContextSchema
            }
        });
    }
    // Setter/getter for client
    set client(client) {
        this.#internalStates.client = client;
    }
    get client() {
        if (!this.isReady) {
            throw new Error("Client not ready");
        }
        return this.#internalStates.client;
    }
    // Method to run all the scripts stored in the core.
    async run(state = createState(), internalState = createInternalState()) {
        if (this.#internalStates.isReady.state === "NOT_READY") {
            throw new Error(this.#internalStates.isReady.reason);
        }
        internalState.name = this.config.appName;
        this.context.startTime = new Date();
        await when(()=>{
            if (state.state !== "running") {
                return false;
            }
            if (state.state === "running") {
                const hasNotDep = Array.from(this.#dependencies).some((item)=>!state.symbolsOfTasks.includes(item));
                if (hasNotDep) {
                    return true;
                }
            }
            if (this.#dependencies.size === 0) {
                return true;
            }
            internalState.state = "waiting_for_dependency";
            for (const dep of this.#dependencies){
                if (!state.symbolsOfTasksCompleted.includes(dep) && !state.symbolsOfTasksFailed.includes(dep)) {
                    return false;
                }
            }
            return true;
        });
        const hasNot = Array.from(this.#dependencies).some((item)=>!state.symbolsOfTasks.includes(item));
        if (hasNot) {
            internalState.state = "failed";
            throw new Error("A dependency was not included in runner");
        }
        const hasFailedDeps = !!state.symbolsOfTasksFailed.some((item)=>this.#dependencies.has(item));
        if (hasFailedDeps) {
            internalState.state = "failed";
            throw new Error("A dependency has failed");
        }
        internalState.state = "running";
        const context = wrapContext(this.context, this.config);
        await Promise.all(this.#scripts.map(async (fn)=>{
            const value = await fn(context, this.config);
            return value;
        })).catch((e)=>{
            internalState.state = "failed";
            throw e;
        });
        internalState.state = "finished";
    }
}
/**
 * Factory function to create a new instance of the `PipesCoreClass`.
 */ const createPipesCore = ()=>{
    const core = new PipesCoreClass({
        modules: [
            PipesCore.name
        ],
        schemas: {
            config: PipesCore.config,
            context: PipesCore.context
        }
    });
    return core;
};
/**
 * Type guard that checks if context has module
 */ const ContextHasModule = (context, key)=>{
    return !!(context && typeof context === "object" && key in context);
};
/**
 * Type guard that checks if config has module
 */ const ConfigHasModule = (config, key)=>{
    return !!(config && typeof config === "object" && key in config);
};

class PipesError extends Error {
    #parameters;
    #duration;
    #message;
    #error;
    constructor({ parameters, duration, message = "Unknown error Occured", error }){
        super(message);
        Object.setPrototypeOf(this, PipesError.prototype);
        this.name = this.constructor.name;
        this.#message = message;
        this.#parameters = parameters || [];
        this.#duration = duration;
        this.#error = typeof error === "undefined" ? undefined : error === null ? undefined : typeof error === "string" ? error : typeof error === "object" && error instanceof Error ? error.toString() : typeof error === "object" && "toString" in error ? error.toString() : undefined;
    }
    getPipesError() {
        return {
            message: this.#message,
            error: this.#error,
            duration: this.#duration,
            parameters: this.#parameters
        };
    }
}

function timeFunction(fn, name) {
    const timeStarted = new Date();
    return (...args)=>{
        try {
            const value = fn(...args);
            const timeEnded = new Date();
            const duration = timeEnded.getTime() - timeStarted.getTime();
            return {
                timeStarted,
                timeEnded,
                duration,
                value,
                name
            };
        } catch (error) {
            const timeEnded = new Date();
            const duration = timeEnded.getTime() - timeStarted.getTime();
            throw new PipesError({
                parameters: args,
                duration,
                error
            });
        }
    };
}

/**
 * This is for a basic task.
 */ const createTask = async (task, texts, context)=>{
    const store = createZodStore({
        duration: numberType().default(0),
        state: unionType([
            literalType("In progress"),
            literalType("Completed"),
            objectType({
                type: literalType("Error"),
                value: anyType()
            })
        ]).default("In progress")
    });
    void render(()=>/*#__PURE__*/ React.createElement(Group, {
            title: texts.inProgress
        }, ((state, duration)=>{
            if (typeof state === "object" && state.type === "Error") {
                return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(Failure, null, texts.error, " ", /*#__PURE__*/ React.createElement(Timestamp, {
                    time: duration,
                    format: "mm:ss.SSS"
                })), /*#__PURE__*/ React.createElement(Error$1, null, JSON.stringify(state.value)));
            }
            if (state === "Completed") {
                return /*#__PURE__*/ React.createElement(Success, null, /*#__PURE__*/ React.createElement(Text, null, texts.finished), /*#__PURE__*/ React.createElement(Timestamp, {
                    time: duration,
                    format: "mm:ss.SSS"
                }));
            }
            return /*#__PURE__*/ React.createElement(Info, null, texts.inProgress, "…");
        })(store.state, store.duration)));
    try {
        const value = await task();
        store.duration = context.getDurationInMs();
        store.state = "Completed";
        return value;
    } catch (error) {
        store.duration = context.getDurationInMs();
        store.state = {
            type: "Error",
            value: error
        };
        throw error;
    }
};

class DynamicPromiseAggregator {
    #promises = new Set();
    #eventEmitter = new EventEmitter();
    #isWatching = false;
    addPromise(promise) {
        const values = Array.isArray(promise) ? promise : [
            promise
        ];
        for (const value of values){
            this.#promises.add(value);
        }
        this.#eventEmitter.emit("newPromiseAdded");
    }
    watch() {
        this.#isWatching = true;
        return new Promise(async (resolve, reject)=>{
            while(this.#isWatching){
                if (this.#promises.size === 0) {
                    await new Promise((resolve)=>this.#eventEmitter.once("newPromiseAdded", resolve));
                    continue;
                }
                try {
                    const promises = [
                        ...this.#promises
                    ];
                    await Promise.all(promises);
                    for (const promise of promises){
                        this.#promises.delete(promise);
                    }
                    if (this.#promises.size === 0) {
                        this.#isWatching = false;
                        return resolve();
                    }
                } catch (error) {
                    return reject(error);
                }
            }
        });
    }
    stopWatching() {
        this.#isWatching = false;
    }
}

class PipesStream extends Writable {
    dataChunks;
    constructor(options){
        super(options);
        // Initialize an array to store data chunks
        this.dataChunks = [];
    }
    _write(chunk, encoding, callback) {
        const utf8String = chunk.toString("utf8");
        this.dataChunks.push(utf8String);
        callback();
    }
    getData() {
        return this.dataChunks;
    }
}

function onCleanup(callback) {
    let called = false;
    const executeCallback = ()=>{
        if (!called) {
            called = true;
            callback();
        }
    };
    const sigintHandler = ()=>{
        executeCallback();
        process.exit(2);
    };
    const sigusr1Handler = ()=>{
        executeCallback();
        process.exit(3);
    };
    const sigusr2Handler = ()=>{
        executeCallback();
        process.exit(4);
    };
    const uncaughtExceptionHandler = (err)=>{
        // eslint-disable-next-line no-console
        console.error("Uncaught exception:", err);
        executeCallback();
        process.exit(99);
    };
    process.on("exit", executeCallback);
    process.on("SIGINT", sigintHandler);
    process.on("SIGUSR1", sigusr1Handler);
    process.on("SIGUSR2", sigusr2Handler);
    process.on("uncaughtException", uncaughtExceptionHandler);
    return (call = true)=>{
        if (call) {
            callback();
        }
        process.removeListener("exit", executeCallback);
        process.removeListener("SIGINT", sigintHandler);
        process.removeListener("SIGUSR1", sigusr1Handler);
        process.removeListener("SIGUSR2", sigusr2Handler);
        process.removeListener("uncaughtException", uncaughtExceptionHandler);
    };
}

const baseDir$1 = {};
// This returns the base dir of the project.
const findPnpRoot = (path)=>{
    if (baseDir$1[path]) {
        return baseDir$1[path];
    }
    const file = existsSync(join(path, "yarn.lock"));
    if (file) {
        baseDir$1[path] = path;
        return path;
    }
    const newPath = join(path, "..");
    if (path === newPath) {
        throw new Error("Could not find root");
    }
    const basePath = findPnpRoot(newPath);
    baseDir$1[path] = basePath;
    return basePath;
};

const baseDir = {};
const getNvmVersion = (root = process.cwd())=>{
    const path = findPnpRoot(root);
    if (baseDir[path]) {
        return baseDir[path];
    }
    let version = null;
    [
        ".nvmrc",
        ".node-version"
    ].map((file)=>{
        return ()=>{
            const nvmrc = join(path, file);
            try {
                return readFileSync(nvmrc, "utf-8");
            } catch (_e) {
                return null;
            }
        };
    }).find((fn)=>{
        const value = fn();
        if (value != null) {
            version = value;
            return true;
        }
        return false;
    });
    if (version && typeof version === "string") {
        baseDir[path] = version.trim();
        return baseDir[path];
    }
    throw new Error("Not found");
};

const listFilteredFiles = async (dir, type = "TEST_FILES")=>{
    const files = [];
    try {
        const entries = await readdir(dir, {
            withFileTypes: true
        });
        for (const entry of entries){
            const entryPath = join(dir, entry.name);
            if (entry.isDirectory() && entry.name === "test") continue;
            if (entry.isDirectory()) {
                const subFiles = await listFilteredFiles(entryPath, type);
                files.push(...subFiles);
                continue;
            }
            if (entry.isFile() && /\.(js|mjs|cjs|ts|tsx)$/.test(entry.name)) {
                if (/\.spec\./.test(entry.name) || /\.typespec\./.test(entry.name)) {
                    if (type === "TEST_FILES" || "ALL") {
                        files.push(entryPath);
                    }
                    continue;
                }
                if (type === "MAIN_FILES" || "ALL") {
                    files.push(entryPath);
                }
            }
        }
    } catch  {}
    return files;
};

class Shell {
    /**
   * Execute a command and return the exit code.
   *
   * @param {string} cmd - The command to execute.
   * @param {Array<string>} args - The arguments for the command.
   * @param {{cwd?: string | undefined, env?: Record<string, string | undefined>}} options
   * @returns {Promise<number>} - Resolves with the exit code.
   */ static execute(cmd, args, options) {
        return new Promise((resolve, reject)=>{
            const child = spawn(cmd, args, {
                env: options.env || undefined,
                cwd: options.cwd || undefined,
                shell: false
            });
            let stdout = "";
            let stderr = "";
            // Listen to stdout and write data to the console sequentially.
            child.stdout.on("data", (data)=>{
                stdout += data.toString();
            //process.stdout.write(data);
            });
            child.stderr.on("data", (data)=>{
                stderr += data.toString();
            //process.stderr.write(data);
            });
            child.on("close", (code)=>{
                resolve({
                    stdout,
                    stderr,
                    code: code == null ? 0 : code
                });
            });
            child.on("error", (error)=>{
                reject(error);
            });
        });
    }
}

const isRunningInsideContainer = async ()=>{
    const isContainarised = isPodman() || isDocker();
    if (!isContainarised) {
        await render(/*#__PURE__*/ React.createElement(Error$1, null, "This should run inside container for best usage."), {
            forceRenderNow: true
        });
    }
};
await isRunningInsideContainer();
class PipesCoreRunner {
    #context = new Set();
    addContext(value) {
        this.#context.add(value);
        return ()=>{
            this.removeContext(value);
        };
    }
    #injectContext = (_context, _config, props)=>{
        if (!this.#client) {
            // We haven't started so this is not injection
            this.addContext(props.context);
            return;
        }
        this.#contextPromiseAggregator.addPromise(this.#processContext(props.context));
    };
    removeContext(value) {
        this.#context.delete(value);
    }
    #_haltObj = {};
    #halt = (e)=>{
        if (this.#_haltObj.halt) {
            void this.#_haltObj.halt(e ? JSON.stringify(e) : "Forced quit");
        } else {
            // Give clean-up time force quit if not
            setTimeout(()=>{
                process.exit(1);
            }, 500);
        }
    };
    #client = null;
    async #processContext(value) {
        if (!this.#client) {
            throw new Error(`Client not set`);
        }
        value.client = this.#client;
        value.haltAll = this.#halt;
        value.addContext = this.#injectContext;
        const internalState = createInternalState();
        this.#tasks.value = [
            ...this.#tasks.value,
            value.symbol
        ];
        this.#store.symbolsOfTasks = [
            ...this.#store.symbolsOfTasks,
            value.symbol
        ];
        reaction(()=>{
            return {
                name: internalState.name,
                state: internalState.state
            };
        }, async ()=>{
            const name = internalState.name;
            const state = internalState.state;
            await this.#taskState.setKey(value.symbol, {
                name,
                state
            });
        });
        void when(()=>internalState.state === "finished" || internalState.state === "failed").then(()=>{
            if (internalState.state === "finished") {
                this.#store.symbolsOfTasksCompleted = [
                    ...this.#store.symbolsOfTasksCompleted,
                    value.symbol
                ];
                return;
            }
            if (internalState.state === "failed") {
                this.#store.symbolsOfTasksFailed = [
                    ...this.#store.symbolsOfTasksFailed,
                    value.symbol
                ];
            }
        });
        await value.run(this.#store, internalState).catch(async (e)=>{
            internalState.state = "failed";
            if (e instanceof DOMError) {
                await render(e.get);
            }
            this.#halt();
        });
    }
    #fakePromise = new Promise((_resolve, reject)=>{
        this.#_haltObj.halt = reject;
    });
    #contextPromiseAggregator = new DynamicPromiseAggregator();
    #contextPromise = this.#contextPromiseAggregator.watch();
    #pipesStream = new PipesStream();
    #tasks = createBasicZodStore(taskSchema);
    #store = createState();
    #taskState = createZodSymbolStore(internalStateStoreSchema);
    #daggerState = createBasicZodStore(unionType([
        literalType("Connecting"),
        literalType("Connected"),
        literalType("Finished"),
        objectType({
            type: literalType("Failed"),
            error: anyType()
        })
    ]).default("Connecting"));
    #renderDaggerInfo() {
        return render(()=>{
            return /*#__PURE__*/ React.createElement(Group, {
                title: "Dagger state"
            }, /*#__PURE__*/ React.createElement(Container, null, ((daggerState)=>{
                if (daggerState.value === "Connecting") {
                    return /*#__PURE__*/ React.createElement(Log, null, "Connecting to Dagger");
                }
                if (daggerState.value === "Connected") {
                    return /*#__PURE__*/ React.createElement(Info, null, "Connected to Dagger");
                }
                if (daggerState.value === "Finished") {
                    return /*#__PURE__*/ React.createElement(Success, null, "Dagger Finished");
                }
                if (typeof daggerState.value === "object" && daggerState.value.type === "Failed") {
                    return /*#__PURE__*/ React.createElement(Error$1, null, daggerState.value.error);
                }
            })(this.#daggerState)));
        });
    }
    #renderTaskState() {
        return render(async ()=>{
            const currentTasks = [
                ...this.#tasks.value
            ];
            const obj = [];
            const values = await this.#taskState.getAll();
            for (const task of currentTasks){
                const value = values[task];
                if (value) {
                    obj.push(value);
                }
            }
            const getState = (state)=>state.split("_").reduce((a, b, index)=>{
                    if (index === 0) {
                        return b.split("").map((e, index)=>{
                            return index === 0 ? e.toUpperCase() : e;
                        }).join("");
                    }
                    return `${a} ${b}`;
                }, "");
            const tableValues = obj.map((e)=>({
                    Name: e.name,
                    State: getState(e.state)
                }));
            if (tableValues.length === 0) {
                return /*#__PURE__*/ React.createElement(React.Fragment, null);
            }
            return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(Group, {
                title: "Pipes tasks changes"
            }, /*#__PURE__*/ React.createElement(Container, null, /*#__PURE__*/ React.createElement(Table, {
                data: tableValues
            }))));
        });
    }
    #renderRawLog() {
        if (!PipesConfig.isDev) {
            return;
        }
        const value = this.#pipesStream.getData();
        forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED(/*#__PURE__*/ React.createElement(Group, {
            title: "Raw Dagger log"
        }, /*#__PURE__*/ React.createElement(Text, null, value)));
    }
    async run() {
        onCleanup(()=>{
            // If program quits for some reason print out the logs if needed
            this.#renderRawLog();
        });
        await this.#renderDaggerInfo();
        await connect(async (client)=>{
            this.#daggerState.value = "Connected";
            this.#client = client;
            await this.#renderTaskState();
            /** Add all context */ this.#contextPromiseAggregator.addPromise(Array.from(this.#context).map((value)=>{
                return this.#processContext(value);
            }));
            this.#store.state = "running";
            await Promise.race([
                this.#fakePromise,
                this.#contextPromise
            ]);
        }, {
            LogOutput: this.#pipesStream
        }).catch((e)=>{
            this.#daggerState.value = {
                type: "Failed",
                error: e
            };
        }).then(()=>{
            if (this.#daggerState.value === "Connected") {
                this.#daggerState.value = "Finished";
            }
        }).finally(()=>{
            setTimeout(()=>{
                // TODO: fix this
                // Give time render and jobs to quit safely.
                if (this.#daggerState.value === "Finished") {
                    process.exit(0);
                }
                process.exit(1);
            }, 2000);
        });
    }
}
const createPipe = async (// eslint-disable-next-line no-shadow
fn)=>{
    const core = new PipesCoreRunner();
    const values = await fn({
        z,
        createPipesCore,
        createConfig,
        createContext,
        createModule,
        contextHasModule: ContextHasModule,
        configHasModule: ConfigHasModule
    });
    for (const value of values){
        // If we define this better we get circular errors…
        core.addContext(value);
    }
    await core.run();
};

export { BRAND, ConfigHasModule, ContextHasModule, DIRTY, EMPTY_PATH, INVALID, NEVER, OK, ParseStatus, PipesCore, PipesCoreClass, PipesCoreConfig, PipesCoreContext, PipesCoreRunner, dom as PipesDOM, PipesError, ZodType as Schema, Shell, ZodAny, ZodArray, ZodBigInt, ZodBoolean, ZodBranded, ZodCatch, ZodDate, ZodDefault, ZodDiscriminatedUnion, ZodEffects, ZodEnum, ZodError, ZodFirstPartyTypeKind, ZodFunction, ZodIntersection, ZodIssueCode, ZodLazy, ZodLiteral, ZodMap, ZodNaN, ZodNativeEnum, ZodNever, ZodNull, ZodNullable, ZodNumber, ZodObject, ZodOptional, ZodParsedType, ZodPipeline, ZodPromise, ZodReadonly, ZodRecord, ZodType as ZodSchema, ZodSet, ZodString, ZodSymbol, ZodEffects as ZodTransformer, ZodTuple, ZodType, ZodUndefined, ZodUnion, ZodUnknown, ZodVoid, _createModule, addIssueToContext, anyType as any, arrayType as array, bigIntType as bigint, booleanType as boolean, coerce, createConfig, createContext, createGlobalZodKeyStore, createGlobalZodStore, createInternalState, createModule, createModuleName, createPipe, createPipesCore, createState, createTask, createZodKeyStore, createZodStore, custom, dateType as date, errorMap as defaultErrorMap, discriminatedUnionType as discriminatedUnion, effectsType as effect, enumType as enum, findPnpRoot, functionType as function, getErrorMap, getNvmVersion, getParsedType, instanceOfType as instanceof, internalStateSchema, internalStateStoreSchema, intersectionType as intersection, isAborted, isAsync, isDirty, isValid, late, lazyType as lazy, listFilteredFiles, literalType as literal, loaderStateSchema, makeIssue, mapType as map, nanType as nan, nativeEnumType as nativeEnum, neverType as never, nullType as null, nullableType as nullable, numberType as number, objectType as object, objectUtil, oboolean, onCleanup, onumber, optionalType as optional, ostring, pipelineType as pipeline, preprocessType as preprocess, promiseType as promise, quotelessJson, recordType as record, setType as set, setErrorMap, stateStoreSchema, strictObjectType as strictObject, stringType as string, symbolType as symbol, taskSchema, timeFunction, effectsType as transformer, tupleType as tuple, undefinedType as undefined, unionType as union, unknownType as unknown, util, voidType as void, z };
//# sourceMappingURL=pipes-core.js.map
