import { z, createConfig, ContextHasModule, onCleanup, createGlobalZodKeyStore, Directory, createContext, createModule } from '@island-is/pipes-core';
import fsSync from 'node:fs';
import { Octokit } from '@octokit/rest';
import fsPromises, { readFile } from 'node:fs/promises';
import { file, dir } from 'tmp-promise';
import { zip } from 'zip-a-folder';

const githubUserschema = z.object({
    login: z.string()
}).default({
    login: ""
});
const githubRepository = z.object({
    fullName: z.string(),
    name: z.string(),
    owner: githubUserschema
}).default({
    fullName: "",
    name: "",
    owner: {
        login: ""
    }
});
const githubPRUrls = z.object({
    htmlUrl: z.string(),
    commentsUrl: z.string()
}).default({
    htmlUrl: "",
    commentsUrl: ""
});

const getDefaultIfCI = ()=>{
    // Check if running in a GitHub Actions environment
    if (process.env.CI !== "true" || !process.env.GITHUB_EVENT_PATH) {
        return undefined;
    }
    // Read the GitHub Actions event payload
    const eventPath = process.env.GITHUB_EVENT_PATH;
    const eventData = JSON.parse(fsSync.readFileSync(eventPath, "utf8"));
    if (!eventData.pull_request) {
        return undefined;
    }
    const prData = eventData.pull_request;
    const repositoryData = eventData.repository;
    const actionData = eventData.action;
    const value = {
        name: repositoryData.full_name,
        number: prData.number,
        action: actionData,
        sourceBranch: prData.head.ref,
        targetBranch: prData.base.ref,
        initiator: {
            login: prData.user.login
        },
        repository: {
            fullName: repositoryData.full_name,
            name: repositoryData.name,
            owner: {
                login: repositoryData.owner.login
            }
        },
        urls: {
            htmlUrl: prData.html_url,
            commentsUrl: prData.comments_url
        }
    };
    // Test parsing
    const parsed = z.object({
        name: z.string(),
        number: z.number(),
        action: z.string(),
        sourceBranch: z.string(),
        targetBranch: z.string(),
        initiator: githubUserschema,
        repository: githubRepository,
        urls: githubPRUrls
    }).strict().safeParse(value);
    return parsed.success ? parsed.data : undefined;
};

const values = await getDefaultIfCI();
const GitHubConfig = createConfig(({ z })=>({
        githubCommitSHA: z.string().default(undefined, {
            env: "GITHUB_SHA"
        }),
        githubToken: z.string().default(undefined, {
            env: "GITHUB_TOKEN"
        }),
        githubOwner: z.string().default(process.env.GITHUB_REPOSITORY?.split("/")[0] ?? "", {
            env: "PIPES_GITHUB_OWNER"
        }),
        githubRepo: z.string().default(process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "", {
            env: "PIPES_GITHUB_REPO"
        }),
        githubCurrentPr: z.optional(z.object({
            name: z.string(),
            number: z.number(),
            action: z.string(),
            sourceBranch: z.string(),
            targetBranch: z.string(),
            initiator: githubUserschema,
            repository: githubRepository,
            urls: githubPRUrls
        }).default(values || undefined))
    }));

const GetOctokitParseOutput = z.custom((value)=>{
    if (value instanceof Octokit) {
        return value;
    }
    throw new Error(`Invalid octokit value`);
});
const GithubGetOctoKit = (context, config)=>{
    if (!config.githubToken) {
        throw new Error("GitHub token not available");
    }
    if (!context.githubOctokit) {
        context.githubOctokit = new Octokit({
            auth: config.githubToken
        });
    }
    return context.githubOctokit;
};

const GithubInitPr = (_context, config)=>{
    const value = getDefaultIfCI();
    if (value) {
        config.githubToken = process.env.GITHUB_TOKEN ?? "";
        config.githubOwner = (process.env.GITHUB_REPOSITORY ?? "").split("/")[0];
        config.githubRepo = (process.env.GITHUB_REPOSITORY ?? "").split("/")[1];
        config.githubCurrentPr = value;
        return;
    }
    throw new Error("Could not set config");
};

const GithubNodePublishParseInput = z.object({
    token: z.string(),
    relativeWorkDir: z.string(),
    container: z.custom().optional(),
    unpublish: z.union([
        z.literal("ifExists"),
        z.literal("always"),
        z.literal("never")
    ]).default("never")
});
const GithubNodePublishParseOutput = z.custom();
const GithubNodePublish = async (context, _config, props)=>{
    if (ContextHasModule(context, "nodeRun")) {
        const oldContainer = props.container ?? await context.nodePrepareContainer();
        const workDir = "/build";
        const workDirNpmrc = `${workDir}/.npmrc`;
        const workDirPackageJSON = `${workDir}/package.json`;
        const { path, cleanup } = await file({
            postfix: ".json"
        });
        const cleanTmp = onCleanup(()=>{
            void cleanup();
        });
        await fsPromises.writeFile(path, `//npm.pkg.github.com/:_authToken=${props.token}`, "utf8");
        const files = oldContainer.directory(props.relativeWorkDir);
        const container = (await context.nodeGetContainer()).withDirectory(workDir, files).withFile(workDirNpmrc, context.client.host().file(path));
        const packageJSON = JSON.parse(await container.file(workDirPackageJSON).contents());
        const fn = async (cmd, message)=>{
            try {
                await container.withWorkdir(workDir).withExec([
                    "npm",
                    ...cmd
                ]).sync();
            } catch (e) {
                throw new Error(message);
            }
            return true;
        };
        const name = packageJSON.name;
        const version = packageJSON.version;
        if (props.unpublish !== "never") {
            try {
                await fn([
                    "unpublish",
                    `${name}@${version}`,
                    "--registry",
                    "https://npm.pkg.github.com"
                ], "Failled removing package");
            } catch (e) {
                if (props.unpublish === "ifExists") {
                    return;
                }
                throw e;
            }
        }
        await fn([
            "publish",
            "--registry",
            "https://npm.pkg.github.com"
        ], "Failled publishing");
        cleanTmp();
        return;
    }
    throw new Error("Node module not set in context");
};

const ArtifactSchema = z.object({
    name: z.string(),
    data: z.custom((value)=>{
        if (value instanceof Buffer) {
            return value;
        }
        throw new Error("Invalid value");
    })
});
const ReleaseInput = z.object({
    state: z.union([
        z.literal("create"),
        z.literal("update"),
        z.literal("create_or_update"),
        z.literal("only_upload_artifacts")
    ]).default("create_or_update"),
    artifactState: z.union([
        z.literal("update"),
        z.literal("deleteAll"),
        z.literal("leaveAlone")
    ]).default("update"),
    artifacts: z.array(ArtifactSchema).default([]),
    owner: z.string(),
    repo: z.string(),
    targetCommitish: z.string(),
    tag: z.string(),
    name: z.string().optional(),
    body: z.string().optional()
});
const ImageStore = await createGlobalZodKeyStore(z.custom(), "_RELEASES");
const AssetsStore = await createGlobalZodKeyStore(z.custom(), "_RELEASES");
let GithubRelease$1 = class GithubRelease {
    constructor(input, git){
        this.#input = ReleaseInput.parse(input);
        this.#git = git;
    }
    #repo = null;
    #input;
    #git;
    #_releaseId = null;
    get #releaseId() {
        return this.#_releaseId;
    }
    set #releaseId(value) {
        this.#_releaseId = value;
    }
    #getProps(props = null) {
        return ReleaseInput.parse({
            ...props,
            ...this.#input
        });
    }
    async #init(props = null) {
        const data = await this.#getReleaseByTagName(props);
        if (data.id !== null) {
            this.#repo = data;
        } else {
            this.#repo = null;
        }
        this.#releaseId = data.id;
    }
    #getImageKey(props = null) {
        const { owner, repo, tag } = this.#getProps(props);
        return `${owner}-${repo}-${tag}`;
    }
    #waitForImage(props = null) {
        return ImageStore.awaitForAvailability(this.#getImageKey(props));
    }
    #getImage(props = null) {
        return ImageStore.getKey(this.#getImageKey(props));
    }
    #setImage(image, props = null) {
        return ImageStore.setKey(this.#getImageKey(props), image);
    }
    async #getReleaseByTagName(props = null) {
        const { owner, repo, tag } = this.#getProps(props);
        const prevValue = await this.#getImage(props);
        if (prevValue) {
            return prevValue;
        }
        try {
            const release = await this.#git.rest.repos.getReleaseByTag({
                owner,
                repo,
                tag
            });
            await this.#setImage(release.data);
            console.log(release.data);
            return release.data;
        } catch (e) {
            console.log(e);
            return {
                id: null
            };
        }
    }
    static async process(newInput, git) {
        const is = new GithubRelease(newInput, git);
        await is.#init();
        await is.#update();
        if (is.#input.artifactState === "deleteAll") {
            await is.#deleteArtifacts(newInput);
        }
        if (is.#input.artifactState === "leaveAlone") {
            return is;
        }
        const artifacts = is.#input.artifacts;
        for (const artifact of artifacts){
            await is.#uploadArtifact(artifact);
        }
        return is;
    }
    #deleteArtifact(artifact, newInput = null) {
        const props = this.#getProps(newInput);
        return this.#git.rest.repos.deleteReleaseAsset({
            asset_id: artifact,
            owner: props.owner,
            repo: props.repo
        });
    }
    async #listArtifactsForRelease(newInput = null) {
        const artifacts = await AssetsStore.getKey(this.#getImageKey());
        if (artifacts) {
            return artifacts;
        }
        if (!this.#releaseId) {
            throw new Error("Release id not set");
        }
        const input = this.#getProps(newInput);
        try {
            const value = await this.#git.paginate(this.#git.rest.repos.listReleaseAssets, {
                owner: input.owner,
                release_id: this.#releaseId,
                repo: input.repo
            });
            console.log(value);
            if (value && Array.isArray(value)) {
                await AssetsStore.setKey(this.#getImageKey(), value);
                return value;
            }
            return [];
        } catch  {
            return [];
        }
    }
    async #deleteArtifacts(newInput = null) {
        if (!this.#releaseId) {
            throw new Error("Release id not set");
        }
        const artifacts = await this.#listArtifactsForRelease(newInput);
        for (const artifact of artifacts){
            const asset = artifact;
            await this.#deleteArtifact(asset.id);
        }
        await AssetsStore.setKey(this.#getImageKey(), []);
    }
    async #deleteArtifactByName(name, newInput = null) {
        const artifacts = await this.#listArtifactsForRelease(newInput);
        const id = artifacts.find((e)=>e.name === name);
        if (!id) {
            // No need to update
            return;
        }
        await this.#deleteArtifact(id.id);
        const newArtifacts = artifacts.filter((e)=>e.name !== name);
        await AssetsStore.setKey(this.#getImageKey(), newArtifacts);
    }
    async #uploadArtifact(artifact, newInput = null) {
        const input = this.#getProps(newInput);
        if (this.#input.artifactState === "leaveAlone") {
            return;
        }
        if (!this.#_releaseId || !this.#repo) {
            // Release ID is null?!?!
            if (input.state !== "only_upload_artifacts") {
                throw new Error("Release empty");
            }
            await this.#waitForImage(newInput);
            if (this.#_releaseId == null || !this.#repo) {
                throw new Error(`Release is empty`);
            }
        }
        const url = this.#repo.upload_url;
        if (input.artifactState === "update") {
            await this.#deleteArtifactByName(artifact.name, newInput);
        }
        const { owner, repo } = input;
        const release_id = this.#_releaseId;
        const { name, data } = artifact;
        const contentType = "application/zip";
        const contentLength = data.length;
        await this.#git.rest.repos.uploadReleaseAsset({
            headers: {
                "content-type": contentType,
                "content-length": contentLength
            },
            owner,
            repo,
            url,
            release_id,
            name,
            // expects string but buffer is valid: https://github.com/octokit/octokit.js/discussions/2087
            data: data
        });
    // Upload artifact
    }
    async #update(newInput = null) {
        const { body, name, owner, repo, tag, state, targetCommitish } = this.#getProps(newInput);
        if (state === "only_upload_artifacts") {
            return;
        }
        if (this.#releaseId == null) {
            // Create new release
            if (state === "update") {
                throw new Error(`Release does not exist`);
            }
            const value = await this.#git.rest.repos.createRelease({
                body,
                name,
                owner,
                repo,
                tag_name: tag,
                target_commitish: targetCommitish
            });
            this.#repo = value.data;
            this.#releaseId = value.data.id;
            return;
        }
        // Updating release as keyof typeof newValues
        if (state === "create") {
            throw new Error(`Release already exists`);
        }
        const newValues = {
            body,
            name,
            tag_name: tag,
            target_commitish: targetCommitish
        };
        const changedValues = (()=>{
            const keys = [
                "body",
                "name",
                "tag_name"
            ];
            if (!this.#repo) {
                return newValues;
            }
            const changedKeys = keys.filter((e)=>{
                if (!this.#repo) {
                    return true;
                }
                // @ts-ignore - any is ok
                const currentValue = this.#repo && e in this.#repo ? this.#repo[e] : null;
                if (currentValue === newValues[e]) {
                    return false;
                }
                return true;
            }).map((e)=>newValues[e]);
            const oldKeys = keys.filter((e)=>!changedKeys.includes(e));
            return keys.reduce((a, b)=>{
                if (oldKeys.includes(b)) {
                    return {
                        ...a,
                        [b]: this.#repo[b]
                    };
                }
                return {
                    ...a,
                    [b]: newValues[b]
                };
            }, {});
        })();
        if (Object.keys(changedValues).length === 0) {
            // No update needed
            return;
        }
        const value = await this.#git.rest.repos.updateRelease({
            body,
            release_id: this.#releaseId,
            name,
            owner,
            repo,
            target_commitish: targetCommitish,
            tag_name: tag
        });
        await this.#setImage(value.data, newInput);
        this.#repo = value.data;
    }
};

const GithubRelease = async (context, config, props)=>{
    const owner = config.githubOwner;
    const repo = config.githubRepo;
    const octokit = context.githubGetOctokit();
    const body = props.body ? {
        body: props.body
    } : {};
    await GithubRelease$1.process({
        ...body,
        owner,
        repo,
        artifactState: "leaveAlone",
        tag: `v${props.version}`,
        name: props.version,
        targetCommitish: config.githubCommitSHA
    }, octokit);
};

const UploadArtifactSchema = z.object({
    version: z.string(),
    name: z.string(),
    files: z.custom((value)=>{
        if (value instanceof Directory) {
            return value;
        }
        throw new Error(`Invalid file`);
    })
});
const GithubUploadArtifact = async (context, config, props)=>{
    const octokit = context.githubGetOctokit();
    const { path, cleanup: dirClean } = await dir();
    const { path: zipPath, cleanup: zipCleanup } = await file({
        postfix: ".zip",
        prefix: `artifact-${props.version}-`
    });
    const cleanup = onCleanup(()=>{
        void zipCleanup();
        void dirClean();
    });
    const owner = config.githubOwner;
    const repo = config.githubRepo;
    await props.files.export(path);
    await zip(path, zipPath);
    const buffer = await readFile(zipPath);
    await GithubRelease$1.process({
        owner,
        repo,
        state: "only_upload_artifacts",
        artifactState: "update",
        artifacts: [
            {
                name: props.name,
                data: buffer
            }
        ],
        tag: `v${props.version}`,
        name: props.version,
        targetCommitish: config.githubCommitSHA
    }, octokit);
    cleanup();
};

const WriteCommentCurrentParseInput = z.object({
    comment: z.string()
});
const WriteCommentCurrentParseOutput = z.custom();
const WriteCommentParseInput = WriteCommentCurrentParseInput.extend({
    prNumber: z.number()
});
const WriteCommentParseOutput = WriteCommentCurrentParseOutput;
const WriteComment = async (context, config, { comment, prNumber })=>{
    const owner = config.githubOwner;
    const repo = config.githubRepo;
    await context.githubGetOctokit().rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: comment
    });
};
const WriteCommentToCurrentPR = async (context, config, { comment })=>{
    if (!config.githubCurrentPr?.number) {
        throw new Error("Current PR info not available");
    }
    await context.githubWriteCommentToPR({
        prNumber: config.githubCurrentPr.number,
        comment
    });
};

const GitHubContext = createContext(({ z, fn })=>({
        /** Publish to npm registry on github */ githubNodePublish: fn({
            value: GithubNodePublishParseInput,
            output: GithubNodePublishParseOutput,
            implement: GithubNodePublish
        }),
        /** Initialize default git config */ githubInitPr: fn({
            implement: GithubInitPr
        }),
        githubOctokit: z.optional(z.custom()),
        githubGetOctokit: fn({
            output: GetOctokitParseOutput,
            implement: GithubGetOctoKit
        }),
        githubWriteCommentToCurrentPr: fn({
            value: WriteCommentCurrentParseInput,
            output: WriteCommentCurrentParseOutput,
            implement: WriteCommentToCurrentPR
        }),
        githubWriteCommentToPR: fn({
            value: WriteCommentParseInput,
            output: WriteCommentParseOutput,
            implement: WriteComment
        }),
        githubUploadArtifact: fn({
            value: UploadArtifactSchema,
            output: z.custom(),
            implement: GithubUploadArtifact
        }),
        githubRelease: fn({
            value: z.object({
                version: z.string(),
                body: z.string().optional()
            }),
            output: z.custom(),
            implement: GithubRelease
        })
    }));

const PipesGitHub = createModule({
    name: "PipesGitHub",
    config: GitHubConfig,
    context: GitHubContext,
    required: [
        "PipesCore"
    ],
    optional: [
        "PipesNode"
    ]
});

export { PipesGitHub };
//# sourceMappingURL=pipes-module-github.js.map
