# @island.is/pipes-loader

## TypeScript and TypeScript React Loader.

**Usage**: Intended to be used as a custom loader in a Node.js environment with ES module support for usage with Pipes.

### 🚀 Usage

```sh

NODE_OPTIONS=--loader=@island.is/pipes-loader node example.ts

```

`yarn install` should automatically add this to .env! in Pipes Development environment.

### 📦 Installation

```bash

yarn add --dev @island.is/pipes-loader

```

Run node with

```bash

NODE_OPTIONS=--experimental-loader=@island.is/pipes-loader node example.ts

```

**Optional**

Add NODE_OPTIONS to an .env file:

```
NODE_OPTIONS=--experimental-loader=@island.is/pipes-loader
```

Either:

- Use [direnv](https://direnv.net/) and add NODE_OPTIONS to your env
- Use yarn v4. Add to you `.yarnrc.yml`

```yaml
injectEnvironmentFiles:
  - .env?
```

[^1]

[^1]: Questionmark indicates that the file is optional and yarn will not fail if it does not exist.

### 🎛️ Core Functions

**pipes-loader** enhances the Node module resolution to transpile Typescript files, using the experimental [NodeJS Loader API](https://nodejs.org/api/esm.html#loaders).

It determines whether a given module should be compiled or not based on its file extension (`.ts` and `.tsx`) and the presence of the file in the file system.

The module provides the following primary functions:

- `resolve`: Determines the correct file path for a given module and decides whether it should be compiled. [^2]

[^2]: [Specs are defined here](https://nodejs.org/api/esm.html#resolvespecifier-context-nextresolve).

- `load`: Handles the actual compilation process for `.ts` and `.tsx` files using the @swc/core. [^3]

[^3]: [Specs are defined here](https://nodejs.org/api/esm.html#loadurl-context-nextload)

> ---
>
> 💡 **Note**
>
> Ensure that @swc/core is installed
> in the environment where this loader operates.
>
> ---

## 🌟 Benefits

- Ease of Use: Simplifies development and deployment.
- Performance: Faster transpilation with @swc/core.

## ⚠️ Caveats

The use of the Node.js Loader API is still experimental, meaning it could change in future versions of Node.js.

This library is probably only suited for projects using Pipes.

## 🛡️ License

License is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
