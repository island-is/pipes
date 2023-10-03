import { createConfig, getNvmVersion, z, Container, PipesDOM, createContext, createModule } from '@island-is/pipes-core';
import { Container as Container$1 } from '@dagger.io/dagger';
import { builtinModules } from 'node:module';
import { join, basename } from 'path';
import { rollup } from 'rollup';
import { swc } from 'rollup-plugin-swc3';
import { file } from 'tmp-promise';
import { writeFile } from 'fs/promises';
import { join as join$1 } from 'path/posix';
import React from 'react';

const PipesNodeConfig = createConfig(({ z })=>({
        nodeDebug: z.boolean().default(false, {
            env: "NODE_DEBUG",
            arg: {
                long: "nodeDebug"
            }
        }),
        nodePackageManager: z.union([
            z.literal("yarn"),
            z.literal("npm")
        ]).default("yarn"),
        nodeImageKey: z.string().default("node-dev"),
        nodeWorkDir: z.string().default("/apps"),
        nodeSourceDir: z.string().default(process.cwd()),
        nodeSourceIncludeOrExclude: z.union([
            z.literal("include"),
            z.literal("exclude"),
            z.literal("include-and-exclude")
        ]).default("exclude"),
        nodeSourceInclude: z.array(z.string()).default([]),
        nodeSourceExclude: z.array(z.string()).default([
            ".env*",
            "**/node_modules",
            "node_modules",
            ".yarn/cache",
            ".yarn/install-state.gz",
            ".yarn/unplugged"
        ]),
        nodeVersion: z.string().default("AUTO")
    }));

const addEnv = async function addEnv(context, config, { container, env }) {
    const imageStore = await context.imageStore;
    const usedContainer = container || await imageStore.awaitForAvailability(`node-${config.nodeImageKey}`);
    const newContainer = context.addEnv({
        container: usedContainer,
        env
    });
    return newContainer;
};

const compileAndRun = async function compileAndRun(context, config, { container, name, file, external, output = {
    output: "stdout"
} }) {
    let value;
    const getMessage = async (messageContainer)=>{
        if (!messageContainer) {
            throw new Error("Container unassigned");
        }
        if ("output" in output) {
            if (output.output === "stdout") {
                return messageContainer.stdout();
            }
            if (output.output === "stderr") {
                return messageContainer.stderr();
            }
        }
        if ("file" in output) {
            const outputFile = (await messageContainer.file(output.file).sync()).contents();
            return outputFile;
        }
        if ("fileFromEnv" in output) {
            const fileName = await messageContainer.envVariable(output.fileFromEnv);
            const outputFile = await (await messageContainer.file(fileName).sync()).contents();
            return outputFile;
        }
        // Default behaviour
        return messageContainer.stdout();
    };
    try {
        const tmpFile = await compileFile(file, external, name);
        const imageStore = await context.imageStore;
        value = await (container ?? imageStore.awaitForAvailability(`node-${config.nodeImageKey}`));
        const tmpFileRef = context.client.host().file(tmpFile);
        value = await (await value.withWorkdir(config.nodeWorkDir).withFile(join(config.nodeWorkDir, basename(tmpFile)), tmpFileRef).withExec([
            "yarn",
            "node",
            basename(tmpFile)
        ]).sync()).withExec([
            "rm",
            basename(tmpFile)
        ]).sync();
        return {
            message: await getMessage(value),
            container: value
        };
    } catch (e) {
        const message = await (()=>{
            try {
                /* @ts-expect-error - this could been unassigned */ return getMessage(value);
            } catch  {
                return `Error occured with ${file} using prefix: ${name}`;
            }
        })();
        return {
            error: e,
            message,
            container: null
        };
    }
};
const nodeResolve = (await import('rollup-plugin-node-resolve')).default;
async function compileFile(inputFile, additionalExternals = [], name) {
    const { path: tmpFilePath } = await file({
        prefix: name,
        postfix: ".mjs"
    });
    const config = {
        input: inputFile,
        output: {
            file: tmpFilePath,
            format: "esm"
        },
        // @ts-expect-error - wrong typing
        plugins: [
            nodeResolve({
                only: []
            }),
            swc({
                minify: false
            })
        ],
        external: [
            ...builtinModules,
            ...builtinModules.map((e)=>`node:${e}`),
            ...additionalExternals
        ]
    };
    const bundle = await rollup(config);
    await bundle.write(config.output);
    await bundle.close();
    return tmpFilePath;
}

const getVersion = async function getVersion(_context, config) {
    if (config.nodeVersion === "AUTO") {
        // TODO move to async:
        const nodeVersion = await getNvmVersion(config.nodeSourceDir);
        config.nodeVersion = nodeVersion;
    }
    return config.nodeVersion;
};

const prepareContainer = async function prepareContainer(context, config) {
    return (await context.imageStore).getOrSet(`node-${config.nodeImageKey}`, async ()=>{
        const container = (await context.nodeGetContainer()).withWorkdir(config.nodeWorkDir);
        const sourceOptions = {
            ...config.nodeSourceIncludeOrExclude === "include" || config.nodeSourceIncludeOrExclude === "include-and-exclude" ? {
                include: config.nodeSourceInclude
            } : {},
            ...config.nodeSourceIncludeOrExclude === "exclude" || config.nodeSourceIncludeOrExclude === "include-and-exclude" ? {
                exclude: config.nodeSourceExclude
            } : {}
        };
        // Currently we are just using yarn
        const source = context.client.host().directory(config.nodeSourceDir, sourceOptions);
        if (config.nodePackageManager === "yarn") {
            const isNode20 = await context.nodeIsVersionGreaterOrEqual({
                version: 20
            });
            let yarnContainer;
            if (isNode20) {
                yarnContainer = await container.withDirectory(config.nodeWorkDir, source).withWorkdir(config.nodeWorkDir).withExec([
                    "corepack",
                    "enable"
                ]).sync();
            } else {
                yarnContainer = await container.withDirectory(config.nodeWorkDir, source).withWorkdir(config.nodeWorkDir).withExec([
                    "npm",
                    "install",
                    "-g",
                    "yarn"
                ]).sync();
            }
            const install = await yarnContainer.withWorkdir(config.nodeWorkDir).withExec([
                "yarn",
                "install"
            ]).sync();
            return install.withWorkdir(config.nodeWorkDir);
        }
        throw new Error(`Package manager ${config.nodePackageManager} not implemented`);
    });
};

const getContainer = async function getContainer(context, _config) {
    const version = await context.nodeGetVersion();
    return (await context.imageStore).getOrSet(`base-node-${version}`, ()=>{
        const container = context.client.container().from(`node:${version}`);
        return container;
    });
};

const isVersionGreaterOrEqual = async function isVersionGreaterOrEqual(context, _config, { version }) {
    const nodeVersion = parseInt((await context.nodeGetVersion()).split(".").find((e)=>e) ?? "0", 10);
    return nodeVersion >= version;
};

const modifyPackageJSON = async function modifyPackageJSON(context, config, props) {
    const container = await context.nodePrepareContainer();
    const packageJSONPath = join$1(config.nodeWorkDir, props.relativeCwd, "package.json");
    const packageJSON = JSON.parse(await container.file(packageJSONPath).contents());
    const _value = await props.fn(packageJSON);
    const value = JSON.stringify(_value, null, 2);
    const { path: tmpFilePath } = await file({
        prefix: "package",
        postfix: ".json"
    });
    await writeFile(tmpFilePath, value, "utf-8");
    const packageJSONNewFile = context.client.host().file(tmpFilePath);
    const newContainer = container.withFile(packageJSONPath, packageJSONNewFile);
    await (await context.imageStore).setKey(`node-${config.nodeImageKey}`, newContainer);
};

const RunStateSchema = z.promise(z.custom((value)=>{
    if (typeof value !== "object" || value === null) {
        throw new Error(`Invalid format`);
    }
    if ("state" in value && value.state === "Success" && "container" in value && value.container && value.container instanceof Container) {
        return {
            state: value.state,
            container: value.container
        };
    }
    if ("state" in value && value.state === "Error" && "error" in value) {
        return {
            state: value.state,
            error: value.error
        };
    }
    throw new Error("Invalid format");
}));
const run = async function run(context, config, { args, relativeCwd = ".", packageManager }) {
    const container = await context.nodePrepareContainer();
    const path = join$1(config.nodeWorkDir, relativeCwd);
    if (config.nodeDebug) {
        void PipesDOM.render(/*#__PURE__*/ React.createElement(PipesDOM.Info, null, "Running ", config.nodePackageManager, " with args: ", args.join(" "), " in path: ", path), {
            forceRenderNow: true
        });
    }
    try {
        const newContainer = await container.withWorkdir(path).withExec([
            packageManager ?? config.nodePackageManager,
            ...args
        ]).sync();
        return {
            state: "Success",
            container: newContainer
        };
    } catch (error) {
        return {
            state: "Error",
            error
        };
    }
};

const PipesNodeContext = createContext(({ z, fn })=>({
        nodeModifyPackageJSON: fn({
            value: z.object({
                relativeCwd: z.string(),
                fn: z.function(z.tuple([
                    z.any()
                ]), z.any())
            }),
            output: z.promise(z.void()),
            implement: modifyPackageJSON
        }),
        nodeIsVersionGreaterOrEqual: fn({
            value: z.object({
                version: z.number()
            }),
            output: z.promise(z.boolean()),
            implement: isVersionGreaterOrEqual
        }),
        nodeRun: fn({
            value: z.object({
                args: z.array(z.string().default(".")),
                relativeCwd: z.string().optional(),
                packageManager: z.union([
                    z.literal("yarn"),
                    z.literal("npm")
                ]).optional()
            }),
            output: RunStateSchema,
            implement: run
        }),
        nodeAddEnv: fn({
            value: z.object({
                container: z.custom().optional(),
                env: z.array(z.tuple([
                    z.string(),
                    z.string()
                ]))
            }),
            output: z.custom((val)=>val),
            implement: addEnv
        }),
        nodeCompileAndRun: fn({
            value: z.object({
                container: z.custom().optional(),
                file: z.string(),
                name: z.string(),
                output: z.union([
                    z.object({
                        output: z.literal("stdout")
                    }),
                    z.object({
                        output: z.literal("stderr")
                    }),
                    z.object({
                        file: z.string()
                    }),
                    z.object({
                        fileFromEnv: z.string()
                    })
                ]).default({
                    output: "stdout"
                }).optional(),
                external: z.array(z.string()).default([]),
                env: z.record(z.string(), z.string()).default({})
            }),
            output: z.custom((val)=>{
                return val;
            }),
            implement: compileAndRun
        }),
        nodeGetVersion: fn({
            value: undefined,
            output: z.promise(z.string()),
            implement: getVersion
        }),
        nodePrepareContainer: fn({
            output: z.promise(z.custom((val)=>{
                if (val instanceof Container$1) {
                    return val;
                }
                throw new Error(`Invalid value`);
            })),
            implement: prepareContainer
        }),
        nodeGetContainer: fn({
            output: z.promise(z.custom((val)=>{
                if (val instanceof Container$1) {
                    return val;
                }
                throw new Error(`Invalid value`);
            })),
            implement: getContainer
        })
    }));

const PipesNode = createModule({
    name: "PipesNode",
    config: PipesNodeConfig,
    context: PipesNodeContext,
    required: [
        "PipesCore"
    ]
});

export { PipesNode, PipesNodeConfig, PipesNodeContext, RunStateSchema, run };
//# sourceMappingURL=pipes-module-node.js.map
