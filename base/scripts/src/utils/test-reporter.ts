import { Transform } from "node:stream";

import type { Simplify } from "@island.is/pipes-core";
export type STATUS_SUCCESS = "Success";
export type STATUS_ERROR = "Error";
export type UNKNOWN_ERROR = "Unknown error";
const obj = [] as any;
export type TestType = "Test";
export type TestResult = Simplify<
  {
    type: TestType;
  } & (
    | { status: STATUS_SUCCESS; name: string }
    | { status: STATUS_ERROR; name: string; file: string; error: string }
    | { status: STATUS_ERROR; message: UNKNOWN_ERROR }
    | { status: STATUS_ERROR; message: string }
  )
>;

const customReporter = new Transform({
  writableObjectMode: true,
  transform(event, _encoding, callback) {
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
        obj.push({
          type: "Test",
          status: "Error",
          name: event.data.name,
          file: event.data.file,
        });
        break;
    }
  },
});

const callback = () => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(obj));
  console.log("\n");
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
