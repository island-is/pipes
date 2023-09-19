import fs from "node:fs/promises";
import path from "node:path";

import { transformFile } from "@swc/core";

import type { SWCError, SWCResult } from "./error-messages.js";
import type { Workspace } from "./workspace.js";

/**
 * @param project - Project
 * @returns - Record with problematic files or null if none
 */
export const compileWithSWC = async (workspace: Workspace): Promise<SWCResult[]> => {
  await fs.mkdir(workspace.distDirectory, { recursive: true });
  const sourceDir = workspace.sourceDirectory;
  const dist = workspace.distDirectory;
  const swcOptions = {
    cwd: workspace.path,
    jsc: {
      target: "esnext" as const,
      parser: {
        syntax: "typescript" as const,
        dynamicImport: true,
      },
      transform: {
        react: {
          pragma: "React.createElement",
          pragmaFrag: "React.Fragment",
          throwIfNamespace: true,
          development: false,
          useBuiltins: false,
        },
      },
    },
    module: {
      type: "nodenext" as const,
      strict: true,
    },
  };

  const problematicFiles: Record<string, SWCError> = {};
  const successFiles: string[] = [];

  for (const file of workspace.files.source.main) {
    try {
      const result = await transformFile(file, swcOptions);
      const currentExtension = path.extname(file);
      const extension = file.endsWith(".tsx") ? ".js" : file.endsWith(".ts") ? ".js" : path.extname(file);

      // Write the output to the 'dist' directory
      const newDir = path.dirname(file.replace(sourceDir, dist));
      await fs.mkdir(newDir, { recursive: true });
      await fs.writeFile(path.join(newDir, `${path.basename(file, currentExtension)}${extension}`), result.code);
      successFiles.push(file);
    } catch (error) {
      if (typeof error !== "object" || error == null) {
        problematicFiles[file] = {
          message: "Unknown error" as const,
        };
      } else if (
        "message" in error &&
        "loc" in error &&
        typeof error.loc === "object" &&
        error.loc != null &&
        "line" in error.loc &&
        "column" in error.loc
      ) {
        problematicFiles[file] = {
          message: error.message as string,
          line: (error.loc.line as number) + 1,
          character: (error.loc.column as number) + 1,
        };
      } else if ("message" in error && "line" in error && "column" in error) {
        problematicFiles[file] = {
          message: error.message as string,
          line: (error.line as number) + 1,
          character: (error.column as number) + 1,
        };
      } else {
        problematicFiles[file] = {
          message: "Unknown error" as const,
        };
      }
    }
  }

  return [
    ...Object.keys(problematicFiles).map((e) => {
      return {
        type: "SWC" as const,
        workspace: workspace.name,
        status: "Error" as const,
        file: e,
        error: problematicFiles[e],
      };
    }),
    ...successFiles.map((e) => {
      return {
        type: "SWC" as const,
        workspace: workspace.name,
        status: "Success" as const,
        file: e,
      };
    }),
  ];
};
