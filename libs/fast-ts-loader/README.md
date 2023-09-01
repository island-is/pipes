# @island.is/fast-ts-loader

## TypeScript and TypeScript React Loader.

**Usage**: Intended to be used as a custom loader in a Node.js environment with ES module support.

```sh
NODE_OPTIONS=--loader=loader.mjs
```

`yarn install` should automatically add this to .env!

This module provides functionality to resolve and load `.ts` and `.tsx` files.
It determines whether a given module should be compiled or not based on its file extension
and the presence of the file in the file system. The primary use-case is to facilitate
the dynamic import of TypeScript and TypeScript React modules, handling both compilation
and resolution.

The module provides the following primary functions:

- `resolve`: Determines the correct file path for a given module and decides whether it should be compiled.
- `load`: Handles the actual compilation process for `.ts` and `.tsx` files using the @swc/core.

Note: Ensure that @swc/core is installed
in the environment where this loader operates.
