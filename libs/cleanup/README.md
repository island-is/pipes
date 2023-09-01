# `@island.is/find-pnp-root`

## Description

This module provides a utility function to detect and return the root directory of a Yarn Plug'n'Play (PnP) project. The root directory is determined by the presence of a `.pnp.cjs` file.

## Usage

```javascript
import { findPnpRoot } from "@island.is/find-pnp-root";

const rootDirectory = findPnpRoot(initialPath);
```

## API

### `findPnpRoot(path: string): string`

**Parameters:**

- `path`: The initial directory path where the search begins.

**Returns:** The root directory path of the Yarn PnP project.

**Behavior:**

- If the environment variable `BASE_DIR` is set, it returns its value.
- Utilizes caching to return previously computed root paths for improved performance on subsequent calls.
- If the `.pnp.cjs` file is found in the provided path or any of its parent directories, the path to the directory containing the file is returned.
- If the root is not found after recursively searching parent directories, it throws an error with the message "Could not find root".

### Exceptions

- `Error`: "Could not find root" – Thrown when the root directory is not found after searching the provided path and its parent directories.

## Example

```javascript
import { findPnpRoot } from "@island.is/find-pnp-root";

const projectRoot = findPnpRoot("/path/to/any/sub/directory");
console.log(projectRoot); // Outputs the path to the root directory of the Yarn PnP project
```
