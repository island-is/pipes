import defaultErrorMap from "./locales/en.js";
import type { ZodErrorMap } from "./ZodError.js";
let overrideErrorMap = defaultErrorMap;
export { defaultErrorMap };
export function setErrorMap(map: ZodErrorMap) {
    overrideErrorMap = map;
}
export function getErrorMap() {
    return overrideErrorMap;
}
