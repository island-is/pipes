/**
 * @file EsLint config
 */
const prettier = require("@island-is/prettier-config");
/**
 * @param {string} path - Path to workspace
 */
module.exports = (path, type = "module") => {
  const typescript = require("./typescript.cjs")(path, type);
  return {
    root: true,
    ignorePatterns: [""],
    env: {
      es6: true,
      es2021: true,
    },
    extends: [
      ...[
        // "./comment.cjs",
        "./array.cjs",
        "./filename.cjs",
        "./prettier.cjs",
        "./import.cjs",
      ].map((file) => require.resolve(file)),
    ],
    ...typescript,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: type,
      ecmaFeatures: {
        experimentalObjectRestSpread: true,
      },
    },
    rules: {
      "no-console": "off",
      "import/named": "off",
      "import/namespace": "off",
      "import/default": "off",
      "import/no-named-as-default-member": "off",
      "import/no-named-as-default": "off",
      "import/no-cycle": "off",
      "import/no-unused-modules": "off",
      "import/no-deprecated": "off",
      "max-len": ["error", { code: prettier.printWidth }],
      "no-alert": "error",
      "prefer-spread": 2,
      "prefer-template": 2,
      "prefer-object-spread": 2,
      "prefer-const": 2,
      radix: 2,
      "no-var": 2,
      "one-var-declaration-per-line": 2,
      "no-shadow": 0,
      "no-self-assign": 2,
      "require-await": 2,
      "no-return-await": 2,
    },
  };
};
