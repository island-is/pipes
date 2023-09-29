import { Container, z } from "@island-is/pipes-core";

type ArtifactContainer = { imageKey: string } | Container;
export const ArtifactContainerSchema = z.object({
  container: z.custom<ArtifactContainer>((value) => {
    if (value instanceof Container) {
      return value;
    }
    if (
      typeof value === "object" &&
      value &&
      "imageKey" in value &&
      value.imageKey &&
      typeof value.imageKey === "string"
    ) {
      return {
        imageKey: value.imageKey,
      };
    }
    throw new Error("Invalid value for artifact");
  }),
});

export const ArtifactSchema = z.object({
  container: ArtifactContainerSchema,
  path: z.string(),
  title: z.string(),
});

export const ArtifactsSchema = z.array(ArtifactSchema).default([]);

export type Artifact = z.infer<typeof ArtifactSchema>;
export type Artifacts = z.infer<typeof ArtifactsSchema>;
