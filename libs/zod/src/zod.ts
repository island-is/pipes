import { parseArgs } from "node:util";

import { ZodType, z } from "zod";

import type { ZodDefault, ZodTypeAny, util } from "zod";

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
  // We need to type augmented methods, so we leave them as they are.
  // eslint-disable-next-line no-shadow, unused-imports/no-unused-vars
  interface ZodType<Output = any, Def extends z.ZodTypeDef = z.ZodTypeDef, Input = Output> {
    default(def?: util.noUndefined<Input>, options?: DefaultProps): ZodDefault<this>;
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    default(def?: () => util.noUndefined<Input>, options?: DefaultProps): ZodDefault<this>;
  }
}

const ZodTypes = ["string", "number", "boolean", "literal"] as const;

const getMostInnerZodType = <prev extends null | "array" | "union">(
  schema: ZodTypeAny,
  prev: prev = null as prev,
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

const oldDefault = ZodType.prototype.default;

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
    options: {
      [options.arg.long]: argOptions,
    },
    allowPositionals: true,
    strict: false,
  });

  const value = (() => {
    if (options.arg?.positional && positionals.length !== 0) {
      return positionals;
    }
    return values[options.arg.long];
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

/** @ts-expect-error - Patching */
ZodType.prototype.default = function (def, options) {
  const fn = oldDefault.bind(this);

  return getArgv(this, options) || getEnv(this, options) || fn(def);
};

export * from "zod";
export * from "./observer.js";
