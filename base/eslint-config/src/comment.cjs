/**
 * @file EsLint config for eslint-comments
 */
module.exports = {
  plugins: ["eslint-comments"],
  rules: {
    "eslint-comments/no-unused-disable": "error",
    "eslint-comments/no-unused-enable": "error",
  },
};
