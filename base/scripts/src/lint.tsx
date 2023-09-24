import { join } from "node:path";

import { PipesDOM, type Simplify, listFilteredFiles } from "@island-is/pipes-core";
import { ESLint } from "eslint";
import React from "react";

import { extractErrorMessage } from "./utils/extract-error-message.js";

export type STATUS_SUCCESS = "Success";
export type STATUS_ERROR = "Error";
export type UNKNOWN_ERROR = "Unknown error";
export type LintType = "Lint";
export type LintError =
  | { message: UNKNOWN_ERROR; detail?: string }
  | { message: string; line: number; character: number };
export type LintResult = Simplify<
  {
    type: LintType;
  } & ({ status: STATUS_SUCCESS; file: string } | { status: STATUS_ERROR; file: string; error: LintError })
>;

export const runESLint = async (path: string): Promise<LintResult[]> => {
  try {
    const eslintconfig = await import(join(path, ".eslintrc.cjs"));
    const eslint = new ESLint({
      baseConfig: eslintconfig.default,
      useEslintrc: false,
      cwd: path,
      fix: false,
    });
    const filesToLint = await listFilteredFiles(join(path, "src"), "ALL");
    const results = await eslint.lintFiles(filesToLint);

    const lintResults = results.map((e) => {
      const baseResult = {
        type: "Lint" as const,
      };

      if (!e.errorCount && !e.warningCount) {
        return {
          ...baseResult,
          status: "Success",
          file: e.filePath,
        } as LintResult;
      }

      const firstError = e.messages[0];
      return {
        ...baseResult,
        status: "Error",
        file: e.filePath,
        error: {
          message: firstError.message,
          line: firstError.line,
          character: firstError.column,
        },
      } as LintResult;
    });

    return lintResults;
  } catch (e) {
    return [
      {
        type: "Lint" as const,
        status: "Error",
        file: path,
        error: {
          message: "Unknown error",
          detail: extractErrorMessage(e),
        },
      },
    ];
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await PipesDOM.render(() => <PipesDOM.Info>Running linter</PipesDOM.Info>);
  const value = await runESLint(process.cwd());
  const successFiles = value.filter((e) => e.status === "Success");
  const errorMessages = value.filter((e) => e.status === "Error");
  const unknownError = errorMessages.find((e) => e.status === "Error" && e.error.message === "Unknown error");
  const errorFiles = errorMessages.reduce(
    (a, b) => {
      if (b.status === "Error" && b.error.message !== "Unknown error") {
        const file = b["file"];
        a[file] = a[file] ?? [];
        const message = b.error.message;
        a[file].push({ message: message });
      }
      return a;
    },
    {} as Record<string, { message: string }[]>,
  );
  const errorMSG = Object.keys(errorFiles).map((a) => {
    const e = errorFiles[a];

    const file = a;
    const errorTable = e.map((e, index) => {
      return (
        <PipesDOM.Row key={index}>
          <PipesDOM.Text>{e.message}</PipesDOM.Text>
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
      {successFiles.length > 0 ? <PipesDOM.Info>{successFiles.length} files linted successfully</PipesDOM.Info> : <></>}
      {errorMessages.length > 0 ? <PipesDOM.Error>{errorMessages.length} failed lint</PipesDOM.Error> : <></>}
      {errorMessages.length === 0 ? (
        <PipesDOM.Success>Lint completed</PipesDOM.Success>
      ) : (
        <PipesDOM.Failure>Lint failed.</PipesDOM.Failure>
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
