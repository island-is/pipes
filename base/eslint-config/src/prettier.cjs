/**
 * @file EsLint config for prettier
 */
module.exports = {
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": ["error", require("@island.is/prettier-config")],
  },
};
