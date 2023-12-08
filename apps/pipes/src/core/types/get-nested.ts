/**
 * @file Get nested key.
 * @description Get nested key from object.
 * @example
 * ```ts
 * type a = getNestedObject<{ a: { b: { c: 1 } } }, "a.b.c">; // 1
 * ```
 */
export type isNestedKey<
  Module extends Record<string, any>,
  Key extends string,
  AddKey extends string = "",
> = Key extends keyof Module
  ? `${AddKey}${Key}`
  : Key extends `${infer First}.${infer Rest}`
    ? First extends keyof Module
      ? isNestedKey<Module[First], Rest, `${AddKey}${First}.`>
      : never
    : never;

export type getNestedObject<
  Module extends Record<string, any>,
  Key extends string,
  AddKey extends string = "",
> = Key extends keyof Module
  ? Module[Key]
  : Key extends `${infer First}.${infer Rest}`
    ? First extends keyof Module
      ? getNestedObject<Module[First], Rest, `${AddKey}${First}.`>
      : never
    : never;
