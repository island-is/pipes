import { getAllWorkspaces } from "./get-all-workspaces.js";
import { getLocalPackageScoop } from "./get-local-package-scope.js";

export const allowed_extension = [".ts", ".tsx"];
export const allowed_other_extensions = [".js", ".jsx", ".mjs", ".cjs", ".json"];
export const all_extensions = [...allowed_other_extensions, allowed_extension];
export const root = process.env["PIPES_PROJECT_ROOT"] || process.cwd();
export const should_use_source_extension_for_local_packages = process.env["PIPES_LOCAL_DEV"] === "true";
export const localScope = should_use_source_extension_for_local_packages ? await getLocalPackageScoop(root) : null;
export const localProjects = should_use_source_extension_for_local_packages ? await getAllWorkspaces(root) : {};
