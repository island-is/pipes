import assert from "node:assert";
import { promises as fsPromises } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { getAllWorkspaces } from "./get-all-workspaces.js";
const { writeFile, rmdir, mkdir } = fsPromises;

async function setupMockProject(root: string, projects: any) {
  await mkdir(root, { recursive: true });
  await writeFile(join(root, "package.json"), JSON.stringify({ workspaces: Object.keys(projects) }));
  for (const [path, content] of Object.entries(projects)) {
    await mkdir(join(root, path), { recursive: true });
    await writeFile(join(root, path, "package.json"), JSON.stringify(content));
  }
}

// Utility function to teardown a mock project structure
async function teardownMockProject(root: string) {
  await rmdir(root, { recursive: true });
}

describe("getAllWorkspaces", () => {
  it("should return the correct workspaces", async () => {
    const root = "/tmp/mockRoot";
    await setupMockProject(root, {
      proj1: { name: "proj1", source: "src" },
      proj2: { name: "proj2", source: "src" },
    });
    const workspaces = await getAllWorkspaces(root);
    assert.deepStrictEqual(workspaces, {
      proj1: { name: "proj1", source: "/tmp/mockRoot/proj1/src" },
      proj2: { name: "proj2", source: "/tmp/mockRoot/proj2/src" },
    });
    await teardownMockProject(root);
  });

  it("should return an empty object if there are no valid workspaces", async () => {
    const root = "/tmp/mockRoot";
    await setupMockProject(root, {
      proj1: { name: "proj1" },
      proj2: { name: "proj2" },
    });
    const workspaces = await getAllWorkspaces(root);
    assert.deepStrictEqual(workspaces, {});
    await teardownMockProject(root);
  });

  it("should handle missing source and dist fields gracefully", async () => {
    const root = "/tmp/mockRoot";
    await setupMockProject(root, {
      proj1: { name: "proj1", source: "src" },
      proj2: { name: "proj2" },
      proj3: { name: "proj3", dist: "dist" },
    });
    const workspaces = await getAllWorkspaces(root);
    assert.deepStrictEqual(workspaces, {
      proj1: { name: "proj1", source: "/tmp/mockRoot/proj1/src" },
      proj3: { name: "proj3", source: "/tmp/mockRoot/proj3/dist" },
    });
    await teardownMockProject(root);
  });
});
