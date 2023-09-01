import { Transform } from "node:stream";

const obj = [] as any;

const customReporter = new Transform({
  writableObjectMode: true,
  transform(event, encoding, callback) {
    callback(null, null);
    switch (event.type) {
      case "test:pass":
        obj.push({ type: "Test", status: "Success", name: event.data.name, file: event.data.file });
        // callback(null, null);
        break;
      case "test:fail":
        if (!event.data.file) {
          break;
        }
        obj.push({ type: "Test", status: "Error", name: event.data.name, file: event.data.file });
        break;
    }
  },
});

const callback = () => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(obj));
};

const exitHandler = callback;
const sigintHandler = () => {
  callback();
  process.exit(2);
};
const sigusr1Handler = () => {
  callback();
  process.exit(3);
};
const sigusr2Handler = () => {
  callback();
  process.exit(4);
};
const uncaughtExceptionHandler = (err: Error) => {
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

export default customReporter;
