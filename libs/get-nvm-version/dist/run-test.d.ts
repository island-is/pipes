#!/usr/bin/env node
import type { Workspace } from "./lib/workspace.js";
export declare const runTestOnWorkspace: (workspace: Workspace) => never[] | Promise<(number | string[])[]>;
