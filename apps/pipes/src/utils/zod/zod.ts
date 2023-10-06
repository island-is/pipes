import { parseArgs } from "node:util";

import { ZodType, z } from "./base-zod/index.js";

import type { DefaultProps, ZodTypeAny } from "./base-zod/index.js";
import { isArray } from "lodash";

export * from "./base-zod/index.js";
export * from "./observer.js";

const ZodTypes = ["string", "number", "boolean", "literal"] as const;

const getMostInnerZodType = <prev extends null | "array" | "union">(
  schema: ZodTypeAny,
  _prev: prev = null as prev,
): (typeof ZodTypes)[number] | `array:${(typeof ZodTypes)[number]}` | `union:literal` => {
  // Check if the current schema has an innerType

  if (schema instanceof z.ZodString) {
    return "string";
  }
  if (schema instanceof z.ZodNumber) {
    return "number";
  }
  if (schema instanceof z.ZodBoolean) {
    return "boolean";
  }
  if (schema instanceof z.ZodLiteral) {
    return "literal";
  }
  if (schema instanceof z.ZodArray) {
    return `array:${getMostInnerZodType(schema._def.type, "array")}` as `array:${(typeof ZodTypes)[number]}`;
  }
  if (schema instanceof z.ZodUnion) {
    return `union:literal`;
  }
  const inner = (schema as any)._def?.innerType;
  if (inner) {
    return getMostInnerZodType(inner);
  }

  throw new Error("Not implemented yet for env");
};

const getMostInnerZodTypeString = <prev extends null | "array" | "union">(
  schema: ZodTypeAny,
  _prev: prev = null as prev,
): `raw:${(typeof ZodTypes)[number]}` | string | string[] => {
  // Check if the current schema has an innerType

  if (schema instanceof z.ZodString) {
    return "raw:string";
  }
  if (schema instanceof z.ZodNumber) {
    return "raw:number";
  }
  if (schema instanceof z.ZodBoolean) {
    return "raw:boolean";
  }
  if (schema instanceof z.ZodLiteral) {
    return schema._def.value as string;
  }
  if (schema instanceof z.ZodArray) {
    return getMostInnerZodTypeString(schema._def.type);
  }
  if (schema instanceof z.ZodUnion) {
    // This should be a union of literals
    // return aarray with the literals

    return schema._def.options.map((e: any) => {
      if (e instanceof z.ZodLiteral) {
        return e._def.value;
      }
      throw new Error("Not implemented yet for env");
    });
  }
  const inner = (schema as any)._def?.innerType;
  if (inner) {
    return getMostInnerZodTypeString(inner);
  }

  throw new Error("Not implemented yet for env");
};

const getIsArray = <prev extends null | "array" | "union">(schema: ZodTypeAny, _prev: prev = null as prev): boolean => {
  // Check if the current schema has an innerType

  if (schema instanceof z.ZodString) {
    return false;
  }
  if (schema instanceof z.ZodNumber) {
    return false;
  }
  if (schema instanceof z.ZodBoolean) {
    return false;
  }
  if (schema instanceof z.ZodLiteral) {
    return false;
  }
  if (schema instanceof z.ZodArray) {
    return true;
  }
  if (schema instanceof z.ZodUnion) {
    return false;
  }
  const inner = (schema as any)._def?.innerType;
  if (inner) {
    return getIsArray(inner);
  }

  throw new Error("Not implemented yet for env");
};

const oldDefault = ZodType.prototype.default;
const oldDescribe = ZodType.prototype.describe;

const getArgv = (context: ZodType<any, any, any>, options: DefaultProps | undefined) => {
  if (
    options === undefined || // Arg overwrites env
    options.arg === undefined
  ) {
    return null;
  }

  const fn = oldDefault.bind(context);
  const zodType = getMostInnerZodType(context);
  const argOptions = {
    type: zodType === "boolean" || zodType === "array:boolean" ? ("boolean" as const) : ("string" as const),
    multiple: zodType.startsWith("array:"),
  };
  if (options.arg.short !== undefined) {
    (argOptions as unknown as { short: string }).short = options.arg.short;
  }
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: options.arg?.long
      ? {
          [options.arg.long]: argOptions,
        }
      : {},
    allowPositionals: true,
    strict: false,
  });

  const value = (() => {
    if (options.arg?.positional && positionals.length !== 0) {
      return positionals;
    }
    return options?.arg?.long ? values[options.arg.long] : undefined;
  })();

  if (value != undefined) {
    switch (zodType) {
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
        if (Array.isArray(value) && value.every((v) => !Number.isNaN(Number(v)))) {
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

const getEnv = (context: ZodType<any, any, any>, options: DefaultProps | undefined) => {
  if (options === undefined || options.env === undefined) {
    return null;
  }

  const fn = oldDefault.bind(context);
  const value = process.env[options.env];
  if (value !== undefined) {
    const zodType = getMostInnerZodType(context);
    switch (zodType) {
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
        return fn(value.split(",").map((v) => v === "true"));

      default:
        throw new Error(`Not implemented yet for this type ${zodType}`);
    }
  }
  return null;
};

export interface Argument {
  isArray: boolean;
  type: string | string[];
  arg?:
    | {
        long?: string | undefined;
        short?: string | undefined;
      }
    | null
    | undefined;
  env?: string | undefined;
  description: string | undefined;
}

export type Arguments = Argument[];

export const PipesArguments: Arguments = [];
const AllKeys: Set<string> = new Set();

const addOptions = (context: z.ZodDefault<ZodType<any>>, options: z.DefaultProps | undefined) => {
  if (options == null) {
    return context;
  }

  const arg: Argument["arg"] = options.arg ?? undefined;
  const env: Argument["env"] = options.env ?? undefined;
  const keys = [
    ...(arg
      ? [arg.long ? `long:${arg.long}` : null, arg.short ? `short:${arg.short}` : null].filter(
          (e): e is string => typeof e === "string",
        )
      : []),
    ...(env ? [`env:${env}`] : []),
  ];
  if (keys.length === 0) {
    return context;
  }
  const hasKey = keys.find((e) => AllKeys.has(e));
  if (hasKey) {
    console.error(`Pipes already has key: ${hasKey}`);
    return context;
  }

  keys.forEach((key) => {
    AllKeys.add(key);
  });
  const type = getMostInnerZodTypeString(context);
  const isArray = getIsArray(context);
  const obj = { arg, env, description: context.description, type, isArray };
  PipesArguments.push(obj);
  (context as any)._argOptions = obj;
  return context;
};

ZodType.prototype.default = function (def, options) {
  const fn = oldDefault.bind(this);

  const newThis = getArgv(this, options) || getEnv(this, options) || fn(def);

  return addOptions(newThis, options);
};

ZodType.prototype.describe = function (description: string) {
  const fn = oldDescribe.bind(this);
  if ((this as any)._argOptions) {
    (this as any)._argOptions.description = description;
  }
  if (this instanceof z.ZodDefault) {
    // Add argument
  }

  return fn(description);
};

export const getHelpDescriptions = (): Arguments => {
  return PipesArguments.filter((e) => e.description != null);
};
