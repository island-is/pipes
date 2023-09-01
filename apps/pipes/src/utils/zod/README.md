# zod

A utility that extends Zod to parse arguments and environment variables, and to create and manage reactive MobX stores with Zod schema validation.

This package is exported by `@island-is/pipes-core`

## 🛠️ Usage

Add `@island-is/pipes-core` and import from there:

```typescript
import { z } from "@island-is/pipes-core";
```

## Features

### Type-safe environment variables and arguments

Zod has been extended in Pipes so it can easily use type-safe env and arguments, for example:

```ts
import { z } from "@island-is/pipes-core";

// Getting string from argument or environment
// default is "fallback default"

const value = z
  .string()
  .default("fallback default", {
    env: "ENV-NAME",
    arg: {
      long: "long-argument-name",
      short: "s",
    },
  })
  .parse(undefined);

//  Value is "fallback default"
//  which can be overriden with environment variable ENV-NAME
//  which can be overriden with argument long-argument-name

console.log(value);
```

**Parameters for extended ZodDefault:**

```typescript
.default(DEFAULT_VALUE, {
    env: ENVIRONMENT_VARIABLE,
    arg: ARGUMENT_VARIABLE
})
```

| Name                   | Required                       | Type                                                   | Description                                                                               | Order                                                   |
| ---------------------- | ------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `DEFAULT_VALUE`        | **Yes** but can be `undefined` | Type of the Zod Type                                   | Same functionality as in Zod previosly, is fallback if arguments and env are not defined. | **3**<br /><br />Fallback if env and arg is not defined |
| `ENVIRONMENT_VARIABLE` | No                             | `string`                                               | If the key exists as a environment variable it is parsed as the Zod Type                  | **2**<br /><br />Can be overriden with an argument.     |
| `ARGUMENT_VARIABLE`    | No                             | `{long: string; short?: string; positional?: boolean}` | If argument is found (long, short or positional) parse it.                                | **1** <                                                 |

### Argument variable

**📖 Example code**

```typescript
// Creating string from argument --name -n or positional
const value = z.string().default(undefined, {
  arg: {
    long: "name",
    short: "n",
    positional: true,
  },
});
```

**Example code output**

| name           | command line       | output in example |
| -------------- | ------------------ | ----------------- |
| **long**       | `run --name pipes` | "pipes"           |
| **short**      | `run -n pipes`     | "pipes"           |
| **positional** | `run pipes`        | "pipes"           |

Parser supports boolean, literal and numbers.

**📖 Example Code**

```typescript
// Creating number from argument --year -y or positional
const value = z.number().default(undefined, {
  arg: {
    long: "year",
    short: "y",
    positional: true,
  },
});
```

**Example code output**

| name           | command line      | output in example |
| -------------- | ----------------- | ----------------- |
| **long**       | `run --year 2024` | 2024              |
| **short**      | `run -y 2024`     | 2024              |
| **positional** | `run 2024`        | 2024              |

**Arrays**

Arguments can also many elements if parsed with an array:

**📖 Example code**

```typescript
// Creating string array from argument --name -n or positional
const values = z.array(z.string()).default(undefined, {
  arg: {
    long: "name",
    short: "n",
    positional: true,
  },
});
```

| name           | command line                   | output in example |
| -------------- | ------------------------------ | ----------------- |
| **long**       | `run --name pipes --name core` | ["pipes", "core"] |
| **short**      | `run -n pipes -n core`         | ["pipes", "core"] |
| **positional** | `run pipes core`               | ["pipes", "core"] |

### Typesafe reactive stores

The `createZodStore` uses MobX and Zod to create a reactive store with validation.

#### Features

- **Schema-based Validation**: All fields in the store are validated against their Zod schema (unless skipped). Any violation throws an error.
- **Functions**: Supports using Pipes Context Commands that can be replaced and still be typesafe.
- **Computed Fields**: Fields defined in the skip array are not directly settable and are calculated using the provided getter function.
- **Reactivity:** All fields in the store are MobX observables. They can be used in any MobX-reactive context.
- **Type Safety:** The returned store is fully type-safe, with typings generated based on the provided Zod schema.

#### 📖 Example

```typescript
import { autorun } from "mobx";

import { createZodStore, z } from "@island-is/pipes-core";

// Create a store with name and age
const schema = {
  name: z.string().optional(),
  age: z.number().optional(),
  lovesPipes: z.boolean(),
};
const skip = [
    { key: "lovesPipes", get: () => {
        return true;
    }];

const store = createZodStore(schema, skip);

// This is always true since, get function in skip always returns true
console.log(store.lovesPipes);

// Name is now David
store.name = "David";

// Age is now 35
store.age = 35;

// THROWS! Age can only be a number
store.age = "This throws";

// Prints "David is 35 years old"
autorun(() => console.log(`${store.name} is ${store.age} years old`));

// This makes autorun run again and print: "David is 40 years old"
store.age = 40;
```

`function createZodStore<Input, Output = Input>(schema: Input, skip?: SkipFunction[]): Output;`

#### Parameters

| Name     | Required | Type                                                                    | Description                                                                                                                                                                            |
| -------- | -------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema` | **Yes**  | Object, with string-keys, values are ZodType or PipesContext functions. | Each field in the schema will be used to create a corresponding observable field in the store.                                                                                         |
| `skip`   | No       | Array of `Skip`                                                         | An optional array of SkipFunction that allows you to skip certain fields when creating the store. These skipped fields can have their values computed through custom getter functions. |

##### Skip type

| Name  | Required | Type                                   | Description                       |
| ----- | -------- | -------------------------------------- | --------------------------------- |
| `key` | **Yes**  | String, keyof schema in createZodStore | The key that will skip MobX store |
| `get` | **Yes**  | Function that returns value            | Getter function                   |
| `set` | No       | Function that accepts new value        | Custom setter function            |

#### Global Key Store

`createGlobalZodKeyStore()`

This function creates or retrieves a singleton Zod store instance associated with a specified key.

##### 📖 Example

```typescript
import { createGlobalZodStore } from "@island-is/pipes-core";

const schema = {
  name: z.string().optional(),
  age: z.number().optional(),
};

createGlobalZodStore(schema, "userStore").then((store) => {
  store.name = "John";
  store.age = 30;
});
```

### Typesafe reactive key-store

Creates a store for managing key-value pairs, where the keys are strings and the values adhere to a Zod schema. This function returns an object with methods for interacting with the store.

```typescript
createZodKeyStore<T extends z.ZodType<any>>(type: T)
```

#### Parameters

- `type: T`: The Zod schema for the value type that the keys map to.

#### Returns

An object with the following methods:

1. **`awaitForAvailability(key: string): Promise<z.infer<T>>`**: Awaits until a value for the given key is available in the store and then returns it. If the key does not exist, it will wait until the value becomes available.

2. **`getKey(key: string): Promise<z.infer<T> | null>`**: Asynchronously retrieves the value for a given key from the store. If the key does not exist, it returns `null`.

3. **`setKey(key: string, value: z.infer<T>): Promise<void>`**: Asynchronously sets the value for a given key in the store. The value is validated against the Zod schema provided during the store creation.

4. **`getOrSet(key: string, fn: () => Promise<z.infer<T>> | z.infer<T>): Promise<z.infer<T>>`**: Asynchronously retrieves the value for a given key from the store. If the key does not exist, the value is set using the provided function `fn`.

#### Example Usage

```typescript
const myZodSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const myStore = createZodKeyStore(myZodSchema);

// Await until a value is available for a key
myStore.awaitForAvailability("user1").then((value) => console.log(`User name is ${value.name}`));

// Since this has not been set before, the set function is called.
// Also the awaitForAvailability gets called with the value so
// this prints User name is John - awaitForAvailability does not get called again
const value = await myStore.getOrSet("user1", { name: "John", age: 30 });

// Get value by key - name: John
const user = await myStore.getKey("user1");

// Set value by key - name is now James
await myStore.setKey("user1", { name: "James", age: 30 });

// Get or set value by key - key is already set.
const newUser = await myStore.getOrSet("user1", () => ({ name: "Doe", age: 25 }));
```

#### Global Key Store

`createGlobalZodKeyStore()`

This function creates or retrieves a singleton Zod key-store instance associated with a specified key.

##### 📖 Example

```typescript
import { createGlobalZodKeyStore } from "@island-is/pipes-core";

const myZodSchema = z.object({
  name: z.string(),
  age: z.number(),
});

createGlobalZodKeyStore(myZodSchema, "userKeyStore").then((store) => {
  store.setKey("user1", { name: "John", age: 30 });
});
```
