# @island.is/pipes-core

Pipes is dev-friendly, testable pipelines library for local & CI/CD platforms, written in Typescript.

> ⚠️**Disclaimer**⚠️: This software is currently in development and is not considered production-ready. It more than likely contains bugs, incomplete features, or other discrepancies. **Use at your own risk**.
>
> It is strongly advised to NOT USE this software in a production environment or for critical applications until it has been thoroughly tested and deemed stable.

Here are the core components of Pipes:

- A highly modular runner, with, states, configuration, locking mechanism and storage, using Dagger to run the code anywhere!

- An extended version of Zod, which is a schema validation library. Our extension enriches Zod's capabilities, tailoring it to the specific needs of our CI/CD processes.

- All functionalities and tools highly integrated to deliver a seamless deployment experience.

## PipeCoreRunner

This class is responsible for managing the lifecycle and execution of multiple "PipesCoreClass" (context) instances, acting as the main runner for your pipe-based application.

Normally developers should use `createPipe` to define it.

### Methods

| Method Signature                                | Description                                                                                        | Arguments                                               | Return Type                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| `addContext(value: PipesCoreClass): () => void` | Adds a new context to the internal context set.                                                    | `value (PipesCoreClass)`: The context object to add.    | A function that removes the added context when called.        |
| `removeContext(value: PipesCoreClass): void`    | Removes a context from the internal context set.                                                   | `value (PipesCoreClass)`: The context object to remove. | `void`                                                        |
| `async run(): Promise<void>`                    | Initiates the execution of all stored contexts. Asynchronously waits for all contexts to complete. | None                                                    | A Promise that resolves when all contexts are done executing. |

### `createPipe(fn: ({ z, createPipesCore }: CreatePipeProps) => Promise<PipeBase[]> | PipeBase[]): Promise<void>`

#### Description

Creates and runs a pipe using the provided function. The function passed to `createPipe` should return an array of `PipeBase` objects, which will be added to the internal context set for execution.

#### Arguments

- `fn`: A function that takes an object with properties:

  - `z`
  - `createPipesCore` - create new context
  - `createConfig` - creates new Config for a module
  - `createContext` - creates new Context for a module
  - `createModule` - creates new Module
  - `contextHasModule` - type-guard for if context has module
  - `configHasModule` - type-guard for if context config has module

  The function should return a `Promise` that resolves to an array of `PipeBase` objects, or directly return an array of `PipeBase` objects.

#### Returns

A `Promise` that resolves when all contexts (pipes) returned by the `fn` function are done executing.

#### Example Usage

```typescript
await createPipe(async ({ z, createPipesCore }) => {
  // Your logic here
  return [
    /* array of PipeBase objects */
  ];
});
```

## 🛡️ License

License is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
