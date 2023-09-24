import { join } from "node:path";

import { type Simplify, listFilteredFiles } from "@island-is/pipes-core";
import ts from "typescript";

export type STATUS_SUCCESS = "Success";
export type STATUS_ERROR = "Error";
export type UNKNOWN_ERROR = "Unknown error";
export type TypescriptType = "Typescript";
export type TypescriptError = { message: UNKNOWN_ERROR } | { message: string; line: number; character: number };
export type TypescriptResult = Simplify<
  {
    type: TypescriptType;
    mode: "test" | "build";
  } & ({ status: STATUS_SUCCESS; file: string } | { status: STATUS_ERROR; file: string; error: TypescriptError })
>;

/**
 * @param workspace - workspace
 * @param type - test or build
 */
export const compileTypescript = async (path: string, type: "test" | "build" = "test"): Promise<TypescriptResult[]> => {
  const tsconfig = type === "test" ? join(path, "tsconfig.json") : join(path, "tsconfig.build.json");
  const dist = type === "test" ? null : join(path, "dist");
  const config = ts.readConfigFile(tsconfig, ts.sys.readFile).config;
  const files = await (type === "test"
    ? listFilteredFiles(join(path, "src"), "TEST_FILES")
    : listFilteredFiles(join(path, "src"), "MAIN_FILES"));
  const parseConfigHost = {
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    readDirectory: ts.sys.readDirectory,
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
  };

  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, process.cwd());
  if (dist) {
    parsed.options.declaration = true;
    parsed.options.emitDeclarationOnly = true;
    parsed.options.declarationDir = dist;
  } else {
    parsed.options.noEmit = true;
  }

  const program = ts.createProgram(files, parsed.options);
  const emitResult = program.emit();

  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  const problematicFiles: Record<string, TypescriptError> = {};

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start ?? 0);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      problematicFiles[diagnostic.file.fileName] = {
        line: line + 1,
        character: character + 1,
        message: message,
      };
    }
  });
  const successFullFiles = files.filter((e) => {
    return !Object.keys(problematicFiles).includes(e);
  });

  return [
    ...successFullFiles.map((e) => {
      return {
        type: "Typescript" as const,
        mode: type,
        status: "Success" as const,
        file: e,
      };
    }),
    ...Object.keys(problematicFiles).map((e) => {
      return {
        type: "Typescript" as const,
        mode: type,
        status: "Error" as const,
        file: e,
        error: problematicFiles[e],
      };
    }),
  ];
};
