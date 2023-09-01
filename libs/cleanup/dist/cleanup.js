export function onCleanup(callback) {
    const exitHandler = callback;
    const sigintHandler = ()=>{
        callback();
        process.exit(2);
    };
    const sigusr1Handler = ()=>{
        callback();
        process.exit(3);
    };
    const sigusr2Handler = ()=>{
        callback();
        process.exit(4);
    };
    const uncaughtExceptionHandler = (err)=>{
        // eslint-disable-next-line no-console
        console.error("Uncaught exception:", err);
        callback();
        process.exit(99);
    };
    process.on("exit", exitHandler);
    process.on("SIGINT", sigintHandler);
    process.on("SIGUSR1", sigusr1Handler);
    process.on("SIGUSR2", sigusr2Handler);
    process.on("uncaughtException", uncaughtExceptionHandler);
    return (call = true)=>{
        if (call) {
            callback();
        }
        process.removeListener("exit", exitHandler);
        process.removeListener("SIGINT", sigintHandler);
        process.removeListener("SIGUSR1", sigusr1Handler);
        process.removeListener("SIGUSR2", sigusr2Handler);
        process.removeListener("uncaughtException", uncaughtExceptionHandler);
    };
}
