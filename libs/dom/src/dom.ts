import * as CI from "./ci.js";
import * as elements from "./elements/elements.js";
import * as factory from "./factory.js";

export const PipesDOM = {
  ...elements,
  ...factory,
  ...CI,
};
