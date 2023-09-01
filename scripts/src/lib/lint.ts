import { ESLint } from "eslint";

import { extractErrorMessage } from "./extract-error-message.js";

import type { LintResult } from "./error-messages.js";
import type { Workspace } from "./workspace.js";

export const runESLint = async (workspace: Workspace): Promise<LintResult[]> => {
  try {
    const eslintconfig = await import(workspace.lint.eslint);
    const eslint = new ESLint({
      baseConfig: eslintconfig.default,
      useEslintrc: false,
      cwd: workspace.path,
      fix: false,
    });
    const filesToLint = [...workspace.files.source.main, ...workspace.files.source.test];
    const results = await eslint.lintFiles(filesToLint);

    const lintResults = results.map((e) => {
      const baseResult = {
        type: "Lint" as const,
        workspace: workspace.name,
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
        workspace: workspace.name,
        status: "Error",
        file: workspace.path,
        error: {
          message: "Unknown error",
          detail: extractErrorMessage(e),
        },
      },
    ];
  }
};
