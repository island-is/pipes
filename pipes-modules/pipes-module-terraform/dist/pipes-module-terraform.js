import { readdir, stat, readFile } from 'node:fs/promises';
import { join as join$1 } from 'node:path/posix';
import { z, createConfig, createContext } from '@island.is/pipes-core';
import { lstat } from 'fs/promises';
import { join } from 'node:path';

const doesFileExists = async (file)=>lstat(file).catch(()=>false).then(()=>true);
const getFilesFromPath = async (props)=>{
    const files = (await readdir(props.path)).map((e)=>join(props.path, e));
    if (props.extension) {
        return files.filter((file)=>file.endsWith(props.extension));
    }
    if (props.directory) {
        return Promise.all(files.filter(async (file)=>{
            const fileStat = await stat(join(props.path, file));
            return fileStat.isDirectory();
        }));
    }
    return files ?? [];
};

/**
 * @file Core module for pipes
 */ const Name = z.string().min(1);
const Path = z.string().or(z.array(z.string())).describe("Path");
const TerraformEnvironment = z.object({
    name: Name,
    terraformDirectory: Path.default([]),
    terraformEnvVariables: z.record(z.string(), z.string()).default({}),
    terraformVersion: z.literal("AUTO").or(z.string()).default("AUTO").describe("The version of terraform to use"),
    terraformDefaultVersion: z.literal("NONE").or(z.string()).default("NONE"),
    terraformGoThroughSubdirectories: z.boolean().default(false).or(z.number()).default(false)
});
createConfig(({ z })=>({
        terraformRoot: z.string().default(process.cwd()).describe("The root directory of terraform"),
        terraformEnvironments: z.custom((value)=>{
            if (typeof value !== "object" || !value) {
                throw new Error(`This should be a record`);
            }
            Object.entries(value).forEach(([key, keyValue])=>{
                if (typeof key !== "string") {
                    throw new Error(`Key should be string`);
                }
                TerraformEnvironment.parse(keyValue);
            });
            return value;
        })
    }));
const PathIncludesPath = (path, rootPath)=>{
    if (typeof rootPath === "string") {
        return path.startsWith(rootPath);
    }
    return !!rootPath.find((e)=>path.startsWith(e));
};
const cache = {};
createContext(({ z, fn })=>({
        terrafromRunPlan: fn({
            value: z.object({}).default({}),
            output: z.custom(),
            implement: (context, config)=>{
                throw new Error("To do");
            }
        }),
        terrafromRunApply: fn({
            value: z.object({}).default({}),
            output: z.custom(),
            implement: ()=>{
                throw new Error("To do");
            }
        }),
        terraformBaseRunEnv: fn({
            value: z.object({
                env: TerraformEnvironment
            }).default({
                env: {}
            }),
            output: z.custom(),
            implement: async (context, config, { env })=>{
                const basePath = env.terraformDirectory;
                if (!basePath) {
                    throw new Error(`No working directory found for ${env.name}`);
                }
                const checkPaths = async (basePath, shouldGoThroughSubdirectories = env.terraformGoThroughSubdirectories)=>{
                    const isWorkingPathAvailable = await doesFileExists(basePath);
                    if (!isWorkingPathAvailable) {
                        throw new Error(`Working directory not found for ${env} at ${basePath}`);
                    }
                    const nextSubdirectoryCheck = typeof shouldGoThroughSubdirectories == "number" ? shouldGoThroughSubdirectories - 1 : shouldGoThroughSubdirectories;
                    const hasTerraform = (await getFilesFromPath({
                        path: basePath,
                        extension: ".tf"
                    })).length > 0;
                    const subdirectories = await Promise.all(shouldGoThroughSubdirectories ? (await getFilesFromPath({
                        path: basePath,
                        directory: true
                    })).map((e)=>checkPaths(e, nextSubdirectoryCheck)) : []);
                    return hasTerraform ? [
                        basePath,
                        ...subdirectories
                    ].flat() : subdirectories.flat();
                };
                const directories = (await Promise.all(Array.isArray(basePath) ? basePath.map((path)=>checkPaths(path)).flat() : (await checkPaths(basePath)).flat())).flat();
                return {
                    directories
                };
            }
        }),
        terraformRunPlanOnEnv: fn({
            value: z.object({
                env: z.string()
            }).default({
                env: ""
            }),
            output: z.custom(),
            implement: (context, config, prop)=>{
                throw new Error("To do");
            }
        }),
        terraformRunPlanOnDirectory: fn({
            value: z.object({
                path: z.string()
            }).default({
                path: ""
            }),
            output: z.custom(),
            implement: (context, config, prop)=>{
                throw new Error("To do");
            }
        }),
        terraformGetVersionFromDirectory: fn({
            value: z.custom((value)=>{
                if (typeof value !== "object" || !value) {
                    throw new Error(`Incorrect parameters`);
                }
                if (!("path" in value)) {
                    throw new Error(`Incorrect parameter, path missing`);
                }
                if (!("env" in value)) {
                    throw new Error(`Incorrect parameter, env missing`);
                }
                Path.parse(value.path);
                TerraformEnvironment.parse(value.env);
            }),
            output: z.custom(),
            implement: async (context, config, { env, path })=>{
                if (!PathIncludesPath(path, env.terraformDirectory)) {
                    throw new Error(// eslint-disable-next-line max-len
                    `${path} cannot by used ${env.name} - path is not a subdirectory of env\n Possible reason: Traveled too far to find version file?`);
                }
                // Force usage of this version
                if (env.terraformVersion !== "AUTO") {
                    return env.terraformVersion;
                }
                // Cached answer
                if (cache[path]) {
                    return cache[path];
                }
                try {
                    const terraformVersionPath = join$1(path, ".terraform-version");
                    const content = await readFile(terraformVersionPath, "utf-8");
                    cache[path] = content;
                    return content;
                } catch  {
                    // Travel further to find version
                    const value = await context.terraformGetVersionFromDirectory({
                        path: join$1(path, ".."),
                        env
                    });
                    cache[path] = value;
                    return value;
                }
            }
        }),
        terraformGetImage: fn({
            value: z.object({
                version: z.string()
            }).default({
                version: "AUTO"
            }),
            output: z.custom(),
            implement: (context, config, { version })=>{
                return context.client.container().from(`hashicorp/terraform:${version}`);
            }
        })
    }));

export { PathIncludesPath };
//# sourceMappingURL=pipes-module-terraform.js.map
