import { ReleaseInput } from "./release.js";

export type GithubUser = {
  login: string;
};

export type GithubRepository = {
  fullName: string;
  name: string;
  owner: GithubUser;
};

export type GithubPRUrls = {
  htmlUrl: string;
  commentsUrl: string;
};

export type GithubPR = {
  name: string;
  number: number;
  action: string;
  sourceBranch: string;
  targetBranch: string;
  initiator: GithubUser;
  repository: GithubRepository;
  urls: GithubPRUrls;
} | null;

export type ReleaseInput = { version: string };
