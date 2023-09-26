import React from "react";
import fetch from "node-fetch";
import { PipesDOM } from "./src/pipes-core.js";
import typescript from "typescript";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import streamifier from "streamifier";
import tar from "tar-stream";
import { unzipSync } from "zlib";

const URL = "https://github.com/colinhacks/zod/archive/refs/tags/v3.22.2.tar.gz";
const OUTPUT_FOLDER = join(fileURLToPath(import.meta.url), "..", "src", "utils", "zod", "base-zod");

const values = [
  {
    _: "Zod URL",
    __: URL,
  },
  {
    _: "Output",
    __: OUTPUT_FOLDER,
  },
];

PipesDOM.render(
  <>
    {values.map((value) => (
      <PipesDOM.Log>
        <PipesDOM.Text bold={true}>{value._} </PipesDOM.Text>
        <PipesDOM.Text>{value.__}</PipesDOM.Text>
      </PipesDOM.Log>
    ))}
  </>,
  {
    forceRenderNow: true,
  },
);

// Step 1. remove old zod folder if it exists
rmSync(OUTPUT_FOLDER, { recursive: true, force: true });

PipesDOM.render(<PipesDOM.Info>Downloading…</PipesDOM.Info>, {
  forceRenderNow: true,
});

/// Step 2. Download zod and unzip it
const response = await fetch(URL);
if (!response.ok) {
  throw new Error(`unexpected response ${response.statusText}`);
}
const fileBuffer = await response.arrayBuffer();

const files = await new Promise<Record<string, string>>((resolve, reject) => {
  const srcFiles = {};
  const extract = tar.extract();
  // Extract method accepts each tarred file as entry, separating header and stream of contents:
  extract.on("entry", (header, stream, next) => {
    const filePath = header.name
      .split("/")
      .filter((e, index) => index !== 0)
      .join("/");
    const isDirectory = header.type === "directory";
    if (
      !isDirectory &&
      !filePath.includes("__tests__") &&
      !filePath.includes("benchmarks") &&
      filePath.startsWith("src/")
    ) {
      let chunks: any[] = [];
      stream.on("data", (chunk) => {
        chunks.push(chunk);
      });
      stream.on("end", () => {
        srcFiles[filePath.replace("src/", "")] = Buffer.concat(chunks).toString("utf8");
        next();
      });
    } else {
      // Ignore and continue to the next entry
      stream.resume();
      next();
    }
  });
  extract.on("finish", () => {
    resolve(srcFiles);
  });

  extract.on("error", (err) => reject(err));
  streamifier.createReadStream(unzipSync(fileBuffer)).pipe(extract);
});
for (const [file, entry] of Object.entries(files)) {
  const filePath = join(OUTPUT_FOLDER, file);
  const path = dirname(filePath);
  mkdirSync(path, { recursive: true });
  writeFileSync(filePath, entry, "utf8");
}
PipesDOM.render(<PipesDOM.Success>Downloaded!</PipesDOM.Success>, {
  forceRenderNow: true,
});

/// Step 3. Walk hack!
/*
 * When using Rollup the elements of z namespace do not get exported.
 * Instead of changing the code manually… we use this hack……
 */
for (const [file] of Object.entries(files)) {
  const filePath = join(OUTPUT_FOLDER, file);
  const newType = addExportModifiersToNamespace(filePath);
  writeFileSync(filePath, newType, "utf8");
}

function createInterfaceNode(): typescript.InterfaceDeclaration {
  const members: typescript.TypeElement[] = [
    typescript.factory.createPropertySignature(
      undefined,
      "env",
      typescript.factory.createToken(typescript.SyntaxKind.QuestionToken),
      typescript.factory.createKeywordTypeNode(typescript.SyntaxKind.StringKeyword),
    ),
    typescript.factory.createPropertySignature(
      undefined,
      "variables",
      typescript.factory.createToken(typescript.SyntaxKind.QuestionToken),
      typescript.factory.createKeywordTypeNode(typescript.SyntaxKind.StringKeyword),
    ),
    typescript.factory.createPropertySignature(
      undefined,
      "arg",
      typescript.factory.createToken(typescript.SyntaxKind.QuestionToken),
      typescript.factory.createTypeLiteralNode([
        typescript.factory.createPropertySignature(
          undefined,
          "short",
          typescript.factory.createToken(typescript.SyntaxKind.QuestionToken),
          typescript.factory.createUnionTypeNode([
            typescript.factory.createKeywordTypeNode(typescript.SyntaxKind.StringKeyword),
            typescript.factory.createKeywordTypeNode(typescript.SyntaxKind.UndefinedKeyword),
          ]),
        ),
        typescript.factory.createPropertySignature(
          undefined,
          "long",
          undefined,
          typescript.factory.createKeywordTypeNode(typescript.SyntaxKind.StringKeyword),
        ),
        typescript.factory.createPropertySignature(
          undefined,
          "positional",
          typescript.factory.createToken(typescript.SyntaxKind.QuestionToken),
          typescript.factory.createKeywordTypeNode(typescript.SyntaxKind.BooleanKeyword),
        ),
      ]),
    ),
  ];

  return typescript.factory.createInterfaceDeclaration(
    [typescript.factory.createModifier(typescript.SyntaxKind.ExportKeyword)],
    "DefaultProps",
    undefined,
    undefined,
    members,
  );
}

function visitModule(node: typescript.Node, context: typescript.TransformationContext) {
  if (typescript.isClassDeclaration(node)) {
    const text = node?.name?.text;
    return typescript.factory.updateClassDeclaration(
      node,
      node.modifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses || [],
      text !== "ZodType" || !node.members
        ? node.members
        : node.members.map((member) => {
            if (
              typescript.isMethodDeclaration(member) &&
              (typescript.isIdentifier(member?.name) ||
                typescript.isStringLiteral(member?.name) ||
                typescript.isNumericLiteral(member?.name))
            ) {
              const methodName = member.name.text;

              if (["default"].includes(methodName)) {
                const newParam = typescript.factory.createParameterDeclaration(
                  undefined, // modifiers
                  undefined, // dotDotDotToken
                  typescript.factory.createIdentifier("options"), // name
                  typescript.factory.createToken(typescript.SyntaxKind.QuestionToken), // questionToken, for making it optional
                  typescript.factory.createTypeReferenceNode("DefaultProps", undefined), // type
                );
                const parameters = [
                  ...member.parameters.map((param) => {
                    return typescript.factory.updateParameterDeclaration(
                      param,
                      param.modifiers,
                      param.dotDotDotToken,
                      param.name,
                      typescript.factory.createToken(typescript.SyntaxKind.QuestionToken),
                      param.type,
                      param.initializer,
                    );
                  }),
                  newParam,
                ];
                return typescript.factory.updateMethodDeclaration(
                  member,
                  member.modifiers,
                  member.asteriskToken,
                  member.name,
                  member.questionToken,
                  member.typeParameters,
                  parameters,
                  member.type,
                  member.body!,
                );
              }

              if (["parse", "safeParse", "parseAsync", "safeParseAsync"].includes(methodName)) {
                const parameters = member.parameters.map((param) => {
                  if ((param.name as any)?.escapedText === "data") {
                    return typescript.factory.updateParameterDeclaration(
                      param,
                      param.modifiers,
                      param.dotDotDotToken,
                      param.name,
                      typescript.factory.createToken(typescript.SyntaxKind.QuestionToken),
                      param.type,
                      param.initializer,
                    );
                  }
                  return param;
                });

                // Return updated Method Declaration
                return typescript.factory.updateMethodDeclaration(
                  member,
                  member.modifiers,
                  member.asteriskToken,
                  member.name,
                  member.questionToken,
                  member.typeParameters,
                  parameters,
                  member.type,
                  member.body!,
                );
              }
            }
            return member;
          }),
    );
  } else if (typescript.isImportDeclaration(node)) {
    const moduleSpecifier = node.moduleSpecifier;
    if (typescript.isStringLiteral(moduleSpecifier)) {
      let newModuleSpecifierText = `${moduleSpecifier.text}.js`;
      if (newModuleSpecifierText === "..js") {
        newModuleSpecifierText = `./index.js`;
      }
      const newModuleSpecifier = typescript.factory.createStringLiteral(newModuleSpecifierText);
      return typescript.factory.updateImportDeclaration(
        node,
        node.modifiers,
        node.importClause,
        newModuleSpecifier,
        node.assertClause,
      );
    }
    return node;
  } else if (typescript.isExportDeclaration(node)) {
    const moduleSpecifier = node.moduleSpecifier;
    if (moduleSpecifier && typescript.isStringLiteral(moduleSpecifier)) {
      let newModuleSpecifierText = `${moduleSpecifier.text}.js`;
      if (newModuleSpecifierText === "..js") {
        newModuleSpecifierText = `./index.js`;
      }
      const newModuleSpecifier = typescript.factory.createStringLiteral(newModuleSpecifierText);
      return typescript.factory.updateExportDeclaration(
        node,
        node.modifiers,
        node.isTypeOnly,
        node.exportClause,
        newModuleSpecifier,
        node.assertClause,
      );
    }
    return node;
  } else {
    return typescript.visitEachChild(node, (child) => visitModule(child, context), context);
  }
}

function addExportModifiersToNamespace(file: string) {
  const program = typescript.createProgram([file], { allowJs: false });
  const sourceFile = program.getSourceFile(file);
  const interfaceDeclaration = createInterfaceNode();
  let newStatements = [...sourceFile!.statements];
  if (file.endsWith("types.ts")) {
    newStatements = [interfaceDeclaration, ...sourceFile!.statements];
  }
  const extendedSourceFile = typescript.factory.updateSourceFile(sourceFile!, newStatements);

  const result = typescript.transform(extendedSourceFile as typescript.Node, [
    (ctx) => {
      return (node) => typescript.visitNode(node, (node) => visitModule(node, ctx));
    },
  ]);

  const updatedSourceFile = result.transformed[0] as typescript.SourceFile;
  result.dispose();

  const printer = typescript.createPrinter({ newLine: typescript.NewLineKind.LineFeed });
  const updatedContent = printer.printFile(updatedSourceFile);
  return updatedContent;
}

PipesDOM.render(<PipesDOM.Success>Patched!</PipesDOM.Success>, {
  forceRenderNow: true,
});
PipesDOM.render(<PipesDOM.Success>Zod ready!</PipesDOM.Success>, {
  forceRenderNow: true,
});
