export const onCleanup = (callback)=>{
    // Called on normal exits
    process.on("exit", callback);
    // Called on `Ctrl+C`
    process.on("SIGINT", ()=>{
        callback();
        process.exit(2);
    });
    // Called on `kill pid` (for example: nodemon restart)
    process.on("SIGUSR1", ()=>{
        callback();
        process.exit(3);
    });
    process.on("SIGUSR2", ()=>{
        callback();
        process.exit(4);
    });
    // Called on uncaught exceptions
    process.on("uncaughtException", (err)=>{
        // eslint-disable-next-line no-console
        console.error("Uncaught exception:", err);
        callback();
        process.exit(99);
    });
};
