import { createGlobalZodKeyStore, z } from "@island-is/pipes-core";

import { ArtifactsSchema } from "./artifact.js";

import type { ArtifactSchema } from "./artifact.js";
import type { Simplify } from "@island-is/pipes-core";
import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import type { Octokit } from "@octokit/rest";

export type CreateReleaseResponse = RestEndpointMethodTypes["repos"]["createRelease"]["response"]["data"];
/**
 * Github Release class
 */
export type ReleaseByTagResponse = Simplify<RestEndpointMethodTypes["repos"]["getReleaseByTag"]["response"]["data"]>;
export type ListReleaseAssetsResponseData = Simplify<
  RestEndpointMethodTypes["repos"]["listReleaseAssets"]["response"]["data"]
>;
export const ReleaseInput = z.object({
  state: z
    .union([
      z.literal("create"),
      z.literal("update"),
      z.literal("create_or_update"),
      z.literal("only_upload_artifacts"),
    ])
    .default("create_or_update"),
  artifactState: z.union([z.literal("update"), z.literal("deleteAll"), z.literal("leaveAlone")]).default("update"),
  artifacts: ArtifactsSchema.default([]),
  owner: z.string(),
  repo: z.string(),
  tag: z.string(),
  name: z.string().optional(),
  body: z.string().optional(),
});

const ImageStore = await createGlobalZodKeyStore<z.ZodType<ReleaseByTagResponse>>(z.custom(), "_RELEASES");
const AssetsStore = await createGlobalZodKeyStore<z.ZodType<ListReleaseAssetsResponseData>>(z.custom(), "_RELEASES");

type Inputs = z.input<typeof ReleaseInput>;
type Input = Partial<z.infer<typeof ReleaseInput>>;
type InputOptional = Input | null;

export class GithubRelease {
  constructor(input: Inputs, git: Octokit) {
    this.#input = ReleaseInput.parse(input);
    this.#git = git;
  }
  #repo: ReleaseByTagResponse | null = null;
  #input: z.output<typeof ReleaseInput>;
  #git: Octokit;
  #_releaseId: null | number = null;
  get #releaseId() {
    return this.#_releaseId;
  }
  set #releaseId(value: null | number) {
    this.#_releaseId = value;
  }
  #getProps(props: InputOptional = null) {
    return ReleaseInput.parse({ ...props, ...this.#input });
  }
  async #init(props: InputOptional = null) {
    const data = await this.#getReleaseByTagName(props);
    if (data.id !== null) {
      this.#repo = data;
    } else {
      this.#repo = null;
    }
    this.#releaseId = data.id;
  }
  #getImageKey(props: InputOptional = null) {
    const { owner, repo, tag } = this.#getProps(props);
    return `${owner}-${repo}-${tag}`;
  }

  #waitForImage(props: InputOptional = null) {
    return ImageStore.awaitForAvailability(this.#getImageKey(props));
  }
  #getImage(props: InputOptional = null) {
    return ImageStore.getKey(this.#getImageKey(props));
  }
  #setImage(image: ReleaseByTagResponse, props: InputOptional = null) {
    return ImageStore.setKey(this.#getImageKey(props), image);
  }
  async #getReleaseByTagName(props: InputOptional = null): Promise<ReleaseByTagResponse | { id: null }> {
    const { owner, repo, tag } = this.#getProps(props);
    const prevValue = await this.#getImage(props);
    if (prevValue) {
      return prevValue;
    }
    try {
      const release = await this.#git.rest.repos.getReleaseByTag({
        owner,
        repo,
        tag,
      });
      await this.#setImage(release.data);
      return release.data;
    } catch (e) {
      if (typeof e === "object" && e && e && "status" in e) {
        if (e.status === 404) {
          return { id: null };
        }
      }
      throw e;
    }
  }

  static async process(newInput: Inputs, git: Octokit): Promise<GithubRelease> {
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
    for (const artifact of artifacts) {
      await is.#uploadArtifact(artifact);
    }
    return is;
  }
  #deleteArtifact(artifact: number, newInput: InputOptional = null) {
    const props = this.#getProps(newInput);
    return this.#git.rest.repos.deleteReleaseAsset({
      asset_id: artifact,
      owner: props.owner,
      repo: props.repo,
    });
  }
  async #listArtifactsForRelease(newInput: InputOptional = null): Promise<ListReleaseAssetsResponseData> {
    const artifacts = await AssetsStore.getKey(this.#getImageKey());
    if (artifacts) {
      return artifacts;
    }
    if (!this.#releaseId) {
      throw new Error("Release id not set");
    }
    const input = this.#getProps(newInput);

    const value = await this.#git.paginate(this.#git.rest.repos.listReleaseAssets, {
      owner: input.owner,
      release_id: this.#releaseId,
      repo: input.repo,
    });
    await AssetsStore.setKey(this.#getImageKey(), value);
    return value;
  }

  async #deleteArtifacts(newInput: InputOptional = null) {
    if (!this.#releaseId) {
      throw new Error("Release id not set");
    }
    const artifacts = await this.#listArtifactsForRelease(newInput);
    for (const artifact of artifacts) {
      const asset = artifact;
      await this.#deleteArtifact(asset.id);
    }
    await AssetsStore.setKey(this.#getImageKey(), []);
  }

  async #deleteArtifactByName(name: string, newInput: InputOptional = null) {
    const artifacts = await this.#listArtifactsForRelease(newInput);
    const id = artifacts.find((e) => e.name === name);
    if (!id) {
      // No need to update
      return;
    }
    await this.#deleteArtifact(id.id);
    const newArtifacts = artifacts.filter((e) => e.name !== name);
    await AssetsStore.setKey(this.#getImageKey(), newArtifacts);
  }

  async #uploadArtifact(artifact: z.infer<typeof ArtifactSchema>, newInput: InputOptional = null) {
    const input = this.#getProps(newInput);
    if (this.#input.artifactState === "leaveAlone") {
      return;
    }
    if (!this.#_releaseId) {
      // Release ID is null?!?!
      if (input.state !== "only_upload_artifacts") {
        throw new Error("Release empty");
      }
      await this.#waitForImage(newInput);
    }
    if (input.artifactState === "update") {
      await this.#deleteArtifactByName(artifact.title, newInput);
    }

    // Upload artifact
  }
  async #update(newInput: InputOptional = null): Promise<void> {
    const { body, name, owner, repo, tag, state } = this.#getProps(newInput);
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
      });
      this.#repo = value.data;
      this.#releaseId = value.data.id;
      return;
    }
    // Updating release
    if (state === "create") {
      throw new Error(`Release already exists`);
    }
    const newValues = { body, name, tag };
    const changedValues = (() => {
      const keys = ["body", "name", "tag_name"] as const;
      if (!this.#repo) {
        return newValues;
      }
      const changedKeys = keys
        .filter((e) => {
          if (!this.#repo) {
            return true;
          }
          // @ts-ignore - any is ok
          const currentValue = this.#repo && e in this.#repo ? (this.#repo[e as any] as any) : null;
          if (currentValue === newValues[e as keyof typeof newValues]) {
            return false;
          }
          return true;
        })
        .map((e) => newValues[e as keyof typeof newValues]);
      const oldKeys = keys.filter((e) => !changedKeys.includes(e));
      return keys.reduce(
        (a, b) => {
          if (oldKeys.includes(b)) {
            return {
              ...a,
              [b]: (this.#repo as any)[b],
            };
          }
          return {
            ...a,
            [b]: newValues[b as keyof typeof newValues],
          };
        },
        {} as unknown as { [key in (typeof keys)[number]]: any },
      );
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
      tag_name: tag,
    });
    await this.#setImage(value.data, newInput);
    this.#repo = value.data;
  }
}
