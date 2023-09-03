# `@island.is/get-nvm-version`

This library provides a utility function to find and return the Node.js version specified in `.nvmrc` or `.node-version` files within a Yarn project.

## 🛠️ Usage

Import `getNvmVersion` from `@island.is/get-nvm-version`

This package is not published outside the monorepo.

## 📖 Example

```typescript
import { getNvmVersion } from "@island.is/get-nvm-version";

const nodeVersion = getNvmVersion("/path/to/any/sub/directory");
console.log(nodeVersion);
```

## 📚 API

### `getNvmVersion(root: string = process.cwd()): string`

**Parameters:**

- `root`: The initial directory path where the search for `.nvmrc` or `.node-version` files begins. Defaults to the current working directory.

**Returns:** The Node.js version as specified in `.nvmrc` or `.node-version` files.

### 🚫 Exceptions

- `Error`: "Not found" – Thrown when neither `.nvmrc` nor `.node-version` files are found after searching the provided path and its parent directories.

## 🛡️ License

License is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
