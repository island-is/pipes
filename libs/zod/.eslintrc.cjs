const addons = require("@island.is/eslint-config")(__dirname);
module.exports = {
  ...addons,
  rules: {
    ...addons["rules"],
    "@typescript-eslint/no-explicit-any": "off",
  },
};
