/**
 * @file EsLint config for imports
 */
module.exports = {
  plugins: ["import", "import-order", "unused-imports"],
  rules: {
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "error",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
    "import/no-anonymous-default-export": "error",
    "import/no-unresolved": "off",
    "import/no-cycle": "error",
    "import/first": "error",
    "import/no-duplicates": "error",
    "sort-imports": [
      "error",
      {
        ignoreDeclarationSort: true,
      },
    ],
    "import/order": [
      `error`,
      {
        groups: ["builtin", "external", "parent", "sibling", "type"],
        alphabetize: { order: `asc`, caseInsensitive: true },
        "newlines-between": `always`,
      },
    ],
    "import/no-useless-path-segments": [
      "error",
      {
        noUselessIndex: true,
      },
    ],
  },
};
