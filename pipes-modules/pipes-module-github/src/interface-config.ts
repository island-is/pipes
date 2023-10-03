import type { GithubPR } from "./interface.js";

export interface IGitHubConfig {
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  githubCurrentPr: GithubPR;
  githubCommitSHA: string;
}
