# @island.is/cleanup

onCleanup accepts a callback function that will be called once when process exits or uncaught exceptions are captured.

## 🛠️ Usage

This library is exported by `@island.is/pipes-core`.

## 📖 Example

```ts
import { onCleanup } from "@island.is/pipes-core";

const stopCleanup = onCleanup(() => {
  console.log("Cleaning up resources...");
});

// Removing the cleanup listeners and calling the cleanup
stopCleanup();

// Removing the cleanup listeners and not calling cleanup
stopCleanup(false);
```

## 📚 API

### `onCleanup(callback: () => void): (call?: boolean) => void`

The `onCleanup` function takes a `callback` function as its argument and returns a new function.

- **callback**: A function to be executed for cleanup tasks.

The returned function can be called to manually trigger the cleanup and remove the event listeners.

## 🚦 Events Covered

The utility listens for the following events and triggers the cleanup accordingly:

- `exit`: Regular process exit
- `SIGINT`: Interrupt from the terminal, usually from `Ctrl+C`
- `SIGUSR1`: User-defined signal 1
- `SIGUSR2`: User-defined signal 2
- `uncaughtException`: Uncaught exceptions in the application

## 🛡️ License

License is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
