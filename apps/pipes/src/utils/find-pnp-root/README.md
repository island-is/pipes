# find-pnp-root;

This library provides a utility function to detect and return the root directory of a Yarn project.

## 🛠️ Usage

Import `findPnpRoot` from `@island-is/pipes-core`

## 📖 Example

```typescript
import { findPnpRoot } from "@island-is/pipes-core";

const projectRoot = findPnpRoot("/path/to/any/sub/directory");
console.log(projectRoot);
```

## 📚 API

### `findPnpRoot(path: string): string`

**Parameters:**

- `path`: The initial directory path where the search begins.

**Returns:** The root directory path of the Yarn PnP project.

### 🚫 Exceptions

- `Error`: "Could not find root" – Thrown when the root directory is not found after searching the provided path and its parent directories.

## 🛡️ License

License is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
