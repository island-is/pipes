export function onCleanup(callback: () => void): (call?: boolean) => void {
  let called = false;

  const executeCallback = () => {
    if (!called) {
      called = true;
      callback();
    }
  };
  const sigintHandler = () => {
    executeCallback();
    process.exit(2);
  };
  const sigusr1Handler = () => {
    executeCallback();
    process.exit(3);
  };
  const sigusr2Handler = () => {
    executeCallback();
    process.exit(4);
  };
  const uncaughtExceptionHandler = (err: Error) => {
    // eslint-disable-next-line no-console
    console.error("Uncaught exception:", err);
    executeCallback();
    process.exit(99);
  };

  process.on("exit", executeCallback);
  process.on("SIGINT", sigintHandler);
  process.on("SIGUSR1", sigusr1Handler);
  process.on("SIGUSR2", sigusr2Handler);
  process.on("uncaughtException", uncaughtExceptionHandler);

  return (call: boolean = true) => {
    if (call) {
      callback();
    }
    process.removeListener("exit", executeCallback);
    process.removeListener("SIGINT", sigintHandler);
    process.removeListener("SIGUSR1", sigusr1Handler);
    process.removeListener("SIGUSR2", sigusr2Handler);
    process.removeListener("uncaughtException", uncaughtExceptionHandler);
  };
}
