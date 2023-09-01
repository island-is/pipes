#!/usr/bin/env node
/**
 * @file Build current project.
 */
import type { Workspace } from "./lib/workspace.js";
export declare const buildWorkspace: (workspace: Workspace) => Promise<(0 | 1)[]>;
