import ts from "typescript";

import type { TypescriptError, TypescriptResult } from "./error-messages.js";
import type { Workspace } from "./workspace.js";

/**
 * @param workspace - workspace
 * @param type - test or build
 */
export const compileTypescript = (workspace: Workspace, type: "test" | "build" = "test"): TypescriptResult[] => {
  const tsconfig = type === "test" ? workspace.tsconfig.test : workspace.tsconfig.build;
  const dist = type === "test" ? null : workspace.distDirectory;
  const config = ts.readConfigFile(tsconfig, ts.sys.readFile).config;
  const files = type === "test" ? workspace.files.source.test : workspace.files.source.main;
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
        workspace: workspace.name,
        status: "Success" as const,
        file: e,
      };
    }),
    ...Object.keys(problematicFiles).map((e) => {
      return {
        type: "Typescript" as const,
        mode: type,
        workspace: workspace.name,
        status: "Error" as const,
        file: e,
        error: problematicFiles[e],
      };
    }),
  ];
};
