import type { Workspace } from "./workspace.js";

export const getBuildOrder = (workspaces: Workspace[]): Workspace[][] => {
  const adjacencyList: Map<Workspace, Workspace[]> = new Map();
  const indegree: Map<Workspace, number> = new Map();

  for (const workspace of workspaces) {
    adjacencyList.set(workspace, []);
    indegree.set(workspace, 0);
  }

  for (const workspace of workspaces) {
    const dependencies = [
      ...workspace.dependencies.dependencies,
      ...workspace.dependencies.devDependencies,
      ...workspace.dependencies.peerDependencies,
    ];

    for (const depName of dependencies) {
      const depWorkspace = workspaces.find((ws) => ws.name === depName);
      if (depWorkspace) {
        adjacencyList.get(workspace)!.push(depWorkspace);
        indegree.set(depWorkspace, indegree.get(depWorkspace)! + 1);
      }
    }
  }

  const result: Workspace[][] = [];
  const queue: Workspace[] = [];

  // Add workspaces with no dependencies to the queue
  for (const [workspace, count] of indegree.entries()) {
    if (count === 0) {
      queue.push(workspace);
    }
  }

  while (queue.length > 0) {
    const currentLevel: Workspace[] = [];
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i++) {
      const workspace = queue.shift()!;
      currentLevel.push(workspace);

      for (const neighbour of adjacencyList.get(workspace)!) {
        indegree.set(neighbour, indegree.get(neighbour)! - 1);
        if (indegree.get(neighbour) === 0) {
          queue.push(neighbour);
        }
      }
    }

    result.push(currentLevel);
  }

  for (const count of indegree.values()) {
    if (count > 0) {
      throw new Error("There's a cycle in the dependency graph!");
    }
  }

  return result.reverse();
};
