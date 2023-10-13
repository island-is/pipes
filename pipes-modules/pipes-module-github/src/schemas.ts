import { z } from "@island.is/pipes-core";

export const githubUserschema = z.object({ login: z.string() }).default({ login: "" });
export const githubRepository = z
  .object({
    fullName: z.string(),
    name: z.string(),
    owner: githubUserschema,
  })
  .default({
    fullName: "",
    name: "",
    owner: {
      login: "",
    },
  });
export const githubPRUrls = z
  .object({
    htmlUrl: z.string(),
    commentsUrl: z.string(),
  })
  .default({
    htmlUrl: "",
    commentsUrl: "",
  });
