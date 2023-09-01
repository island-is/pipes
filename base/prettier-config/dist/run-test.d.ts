#!/usr/bin/env node
/**
 * This is for testing.
 * It run three tasks:
 * a) Builds the whole project with swc
 * b) Waits for build to finish, copies test files to tmp directory and runs tests.
 * c) Runs tsc to check all files for type error, including test files.
 *
 * This is all run concurrently since tsc takes it's time.
 *
 * This should be run from the project directory by:
 * yarn run-test
 * or
 * {path-to-this-folder}/run-test.js
 */
import type { Workspace } from "./lib/workspace.js";
export declare const runTestOnWorkspace: (workspace: Workspace) => Promise<number[]>;
