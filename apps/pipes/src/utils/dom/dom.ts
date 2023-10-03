import { setSecret } from "@actions/core";
export { render, haltAllRender } from "../ink/index.js";

export * from "./elements/elements.js";

export { DOMError } from "./dom-error.js";

export const setMask = (value: (string | number) | (string | number)[]): void => {
  if (Array.isArray(value)) {
    value.filter(Boolean).forEach((item) => setMask(item));
    return;
  }
  setSecret(`${value}`);
};
