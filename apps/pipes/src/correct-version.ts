import { SUPPORTED_NODE_VERSION } from "./const.js";

export const isCorrectVersion = (): true | string => {
  return process.version.startsWith(`v${SUPPORTED_NODE_VERSION}`)
    ? true
    : `Pipes supports node version v${SUPPORTED_NODE_VERSION}.x but you are running ${process.version}`;
};
