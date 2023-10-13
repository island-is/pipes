import type { Container, Directory } from "@dagger.io/dagger";
import type { graphql } from "@octokit/graphql";
import type { Octokit } from "@octokit/rest";

export interface IGitHubContext {
  githubGetOctokitGQL: () => typeof graphql;
  githubEnableAutoMergePR: (prop: { pullNumber?: number | undefined }) => Promise<void>;
  githubApprovePR: (prop: { pullNumber?: number | undefined; body?: string | undefined }) => Promise<void>;
  githubUploadArtifact: (prop: { version: string; name: string; files: Directory }) => Promise<void>;
  githubNodePublish: (prop: {
    token: string;
    relativeWorkDir: string;
    container?: Container | undefined;
    unpublish?: "ifExists" | "always" | "never" | undefined;
  }) => Promise<void>;
  githubInitPr: () => void;
  githubOctokit: Octokit | null;
  githubOctokitGQL: typeof graphql | null;
  githubGetOctokit: () => Octokit;
  githubWriteCommentToPR: (prop: { prNumber: number; comment: string }) => Promise<void>;
  githubWriteCommentToCurrentPr: (prop: { comment: string }) => Promise<void>;
  githubRelease: (prop: { version: string; body?: string | undefined }) => Promise<void>;
}
