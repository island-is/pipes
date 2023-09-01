import { getAllWorkspaces as getAllWorkspaces } from "../../scripts/src/lib/get-all-workspaces.js";
/** THIS IS ALWAYS RUN FROM CI */ const workspaces = await getAllWorkspaces();
const buildOrder = await generateHashesFromBuild(getBuildOrder(workspaces));
