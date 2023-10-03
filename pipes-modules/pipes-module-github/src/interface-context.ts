import type { Container, Directory } from "@dagger.io/dagger";
import type { Octokit } from "@octokit/rest";

export interface IGitHubContext {
  githubUploadArtifact: (prop: { version: string; name: string; files: Directory }) => Promise<void>;
  githubNodePublish: (prop: {
    token: string;
    relativeWorkDir: string;
    container?: Container | undefined;
    unpublish?: "ifExists" | "always" | "never" | undefined;
  }) => Promise<void>;
  githubInitPr: () => void;
  githubOctokit: Octokit | null;
  githubGetOctokit: () => Octokit;
  githubWriteCommentToPR: (prop: { prNumber: number; comment: string }) => Promise<void>;
  githubWriteCommentToCurrentPr: (prop: { comment: string }) => Promise<void>;
  githubRelease: (prop: { version: string; body?: string | undefined }) => Promise<void>;
}
