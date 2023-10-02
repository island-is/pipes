import fs, { readFileSync } from 'node:fs';
import path, { dirname, join } from 'node:path';
import { z } from '@island-is/pipes-core';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(dirname(dirname(import.meta.url)));
const packageJSONPath = join(rootDir, "package.json");
const packageJSON = JSON.parse(readFileSync(packageJSONPath, "utf-8"));
const packageManager = packageJSON["packageManager"].split("yarn@")[1];
const version = packageJSON["version"];
// TODO: This should be auto generated
const YARN_VERSION = packageManager;
const VERSION = version;

const PackageJSON = ({ name, version, yarnVersion })=>{
    return JSON.stringify({
        name,
        version: "0.0.1",
        packageManager: `yarn@${yarnVersion}`,
        type: "module",
        scripts: {
            dev: "node src/ci.tsx"
        },
        dependencies: {
            "@island-is/pipes-core": version
        }
    }, null, 2);
};

const sourceFile = [
    'import { createPipe } from "@island-is/pipes-core";',
    "",
    "await createPipe(({ createPipesCore }) => {",
    "  const mainContext = createPipesCore();",
    "  mainContext.addScript(() => {",
    "    console.log(`Hello world`);",
    "  });",
    "  return [mainContext];",
    "});",
    ""
].join("\n");

const createYARNRC = ()=>{
    return [
        "injectEnvironmentFiles:",
        "   - .env.root?",
        "nmMode: hardlinks-local",
        "nodeLinker: node-modules",
        'npmScopes: { island-is: { npmRegistryServer: "https://npm.pkg.github.com" } }'
    ].join("\n");
};

function getAppPaths(root, appName) {
    const appPath = path.join(root, appName);
    const srcPath = path.join(appPath, "src");
    return {
        appPath,
        srcPath
    };
}
function createDirectories(path) {
    fs.mkdirSync(path, {
        recursive: true
    });
}
function writeFile(filePath, content, encoding = "utf-8") {
    fs.writeFileSync(filePath, content, encoding);
}
function main(root = process.cwd(), appNameArg = undefined) {
    const appName = z.string().default(appNameArg, {
        arg: {
            long: "appName",
            positional: true
        }
    }).parse(undefined);
    const { appPath, srcPath } = getAppPaths(root, appName);
    createDirectories(srcPath);
    writeFile(path.join(srcPath, "ci.tsx"), sourceFile);
    writeFile(path.join(appPath, "yarn.lock"), "");
    const packageJsonPath = path.join(appPath, "package.json");
    const packageJsonContent = PackageJSON({
        name: appName,
        yarnVersion: YARN_VERSION,
        version: VERSION
    });
    writeFile(packageJsonPath, packageJsonContent);
    const yarnrcPath = path.join(appPath, ".yarnrc.yml");
    writeFile(yarnrcPath, createYARNRC());
    console.log("App has been created successfully.");
}

main();
//# sourceMappingURL=create-pipes.js.map
