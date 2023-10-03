import { Directory, Container } from '@dagger.io/dagger';
import { Octokit } from '@octokit/rest';
import { createModuleDef, PipesCoreModule, Simplify, ModuleReturnType } from '@island-is/pipes-core';
import { PipesNodeModule } from '@island-is/pipes-module-node';

type GithubUser = {
    login: string;
};
type GithubRepository = {
    fullName: string;
    name: string;
    owner: GithubUser;
};
type GithubPRUrls = {
    htmlUrl: string;
    commentsUrl: string;
};
type GithubPR = {
    name: string;
    number: number;
    action: string;
    sourceBranch: string;
    targetBranch: string;
    initiator: GithubUser;
    repository: GithubRepository;
    urls: GithubPRUrls;
} | null;

interface IGitHubConfig {
    githubToken: string;
    githubOwner: string;
    githubRepo: string;
    githubCurrentPr: GithubPR;
    githubCommitSHA: string;
}

interface IGitHubContext {
    githubUploadArtifact: (prop: {
        version: string;
        name: string;
        files: Directory;
    }) => Promise<void>;
    githubNodePublish: (prop: {
        token: string;
        relativeWorkDir: string;
        container?: Container | undefined;
        unpublish?: "ifExists" | "always" | "never" | undefined;
    }) => Promise<void>;
    githubInitPr: () => void;
    githubOctokit: Octokit | null;
    githubGetOctokit: () => Octokit;
    githubWriteCommentToPR: (prop: {
        prNumber: number;
        comment: string;
    }) => Promise<void>;
    githubWriteCommentToCurrentPr: (prop: {
        comment: string;
    }) => Promise<void>;
    githubRelease: (prop: {
        version: string;
        body?: string | undefined;
    }) => Promise<void>;
}

type PipesGitHubModule = createModuleDef<"PipesGitHub", IGitHubContext, IGitHubConfig, [
    PipesCoreModule
], [
    PipesNodeModule
]>;

declare const PipesGitHub: Simplify<ModuleReturnType<PipesGitHubModule>>;

export { PipesGitHub, type PipesGitHubModule };
