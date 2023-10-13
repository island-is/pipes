import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { PipesDOM, Shell, listFilteredFiles } from "@island.is/pipes-core";
import React from "react";

import { compileTypescript } from "./utils/typecheck.js";

import type { TestResult } from "./utils/test-reporter.js";
import type { TypescriptResult } from "./utils/typecheck.js";

const TEST_PATH = join(fileURLToPath(import.meta.url), "..");
const TEST_REPORTER = join(TEST_PATH, "utils", "test-reporter.ts");

export const testRunner = async (path: string): Promise<TestResult[]> => {
  const files = await listFilteredFiles(join(process.cwd(), "src"));
  let results: TestResult[] = [];
  for (const file of files) {
    const { stdout, code } = await Shell.execute(process.execPath, ["--test-reporter", TEST_REPORTER, "--test", file], {
      cwd: path,
      env: process.env,
    });
    if (code !== 0) {
      results = [
        ...results,
        {
          type: "Test",
          status: "Error",
          name: "Error",
          file: file,
          message: "Unknown error",
        } as TestResult,
      ];
    }
    try {
      const data = (JSON.parse(stdout) as TestResult[]).map((e) => ({
        ...e,
      }));
      results = [...results, ...data];
    } catch (e) {
      results = [
        ...results,
        {
          type: "Test",
          status: "Error",
          message: JSON.stringify(e),
        } as TestResult,
      ];
    }
  }
  return results;
};

export const typecheckTest = (path: string): Promise<TypescriptResult[]> => {
  return compileTypescript(path, "test");
};

export const test = async (path: string): Promise<(TestResult | TypescriptResult)[]> => {
  const values = await Promise.all([typecheckTest(path), testRunner(path)]);
  return [...values[0], ...values[1]];
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await PipesDOM.render(() => <PipesDOM.Info>Running tests</PipesDOM.Info>);
  const value = await test(process.cwd());
  const successFiles = value.filter((e) => e.status === "Success");
  const errorMessages = value.filter((e) => e.status === "Error");
  const unknownError = errorMessages.find((e) => "message" in e);
  const errorFiles = errorMessages.reduce(
    (a, b) => {
      if (b.status === "Error" && b && "file" in b) {
        const file = b["file"];
        const name = "name" in b ? b["name"] : "Type error";
        a[file] = a[file] ?? [];
        const message = typeof b["error"] === "object" && "message" in b["error"] ? b["error"].message : undefined;
        a[file].push({ name, message: message });
      }
      return a;
    },
    {} as Record<string, { name: string; message?: string }[]>,
  );
  const errorMSG = Object.keys(errorFiles).map((a) => {
    const e = errorFiles[a];

    const file = a;
    const errorTable = e.map((e) => {
      return (
        <PipesDOM.Row key={e.name}>
          <PipesDOM.Text>{e.name}</PipesDOM.Text>
          {e.message ? <PipesDOM.Text>RRR{e.message}</PipesDOM.Text> : null}
        </PipesDOM.Row>
      );
    });
    const fileName = file.replace(join(process.cwd(), "src"), "");
    return (
      <React.Fragment key={a}>
        <PipesDOM.Container>
          <PipesDOM.Text color="red">{fileName}</PipesDOM.Text>
        </PipesDOM.Container>
        {errorTable}
      </React.Fragment>
    );
  });

  await PipesDOM.render(() => (
    <>
      {errorMSG}
      {unknownError ? <PipesDOM.Error>Unknown error</PipesDOM.Error> : <></>}
      {successFiles.length > 0 ? <PipesDOM.Info>{successFiles.length} tests ran successfully</PipesDOM.Info> : <></>}
      {errorMessages.length > 0 ? <PipesDOM.Error>{errorMessages.length} tests failed</PipesDOM.Error> : <></>}
      {errorMessages.length === 0 ? (
        <PipesDOM.Success>Test completed</PipesDOM.Success>
      ) : (
        <PipesDOM.Failure>Test failed.</PipesDOM.Failure>
      )}
    </>
  ));
  setTimeout(() => {
    if (errorMessages.length > 0) {
      process.exit(1);
    }
    process.exit(0);
  }, 100);
}
