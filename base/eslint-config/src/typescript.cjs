/**
 * @file EsLint config Typescript
 */
const { join } = require("path");

/**
 * @param {string} path - Path to workspace
 * @param {string} type - Type
 */
module.exports = (path, type) => ({
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ["*.ts", "*.tsx", "*.d.ts", "*.js", "*.jsx", "*.cjs"],
      plugins: ["@typescript-eslint/eslint-plugin"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: join(path, "./tsconfig.json"),
        createDefaultProgram: false,
        ecmaVersion: "latest",
        sourceType: type,
        ecmaFeatures: {
          jsx: true,
          modules: true,
          experimentalObjectRestSpread: true,
        },
      },
      settings: {
        "import/parsers": {
          [require.resolve("@typescript-eslint/parser")]: [".ts", ".tsx", ".d.ts"],
        },
        "import/resolver": {
          [require.resolve("eslint-import-resolver-node")]: {
            extensions: [".js", ".jsx", ".ts", ".tsx"],
          },
          [require.resolve("eslint-import-resolver-typescript")]: {
            alwaysTryTypes: true,
          },
        },
      },
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-use-before-define": ["error", "nofunc"],
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false, checksConditionals: true }],
        // We use any alot for generics
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/unified-signatures": "error",
        "@typescript-eslint/no-floating-promises": "error",
      },
    },
    {
      files: ["*.spec.*", "*.typespec.*"],
      rules: {
        "@typescript-eslint/no-floating-promises": "off",
      },
    },
    {
      files: ["*.js", "*.jsx"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
      },
    },
  ],
});
