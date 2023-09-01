/**
 * @file EsLint config for filenames
 */
module.exports = {
  plugins: ["filenames-simple"],
  rules: {
    "filenames-simple/naming-convention": [
      "error",
      {
        rule: "kebab-case",
        excepts: ["index", ".eslintrc.cjs", "eslintrc", "prettierrc"],
      },
    ],
  },
};
