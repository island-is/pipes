import assert from "node:assert";
import { EventEmitter } from "node:events";
import test from "node:test";

const mockProcess = new EventEmitter();

const onCleanup = (callback: () => void) => {
  mockProcess.on("exit", callback);
  mockProcess.on("SIGINT", callback);
  mockProcess.on("SIGUSR1", callback);
  mockProcess.on("SIGUSR2", callback);
  mockProcess.on("uncaughtException", callback);
};

test("onCleanup should trigger callback on 'exit'", () => {
  let called = false;
  onCleanup(() => {
    called = true;
  });
  mockProcess.emit("exit");
  assert.strictEqual(called, true);
});

test("onCleanup should trigger callback on 'SIGINT'", () => {
  let called = false;
  onCleanup(() => {
    called = true;
  });
  mockProcess.emit("SIGINT");
  assert.strictEqual(called, true);
});
