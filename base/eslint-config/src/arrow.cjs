/**
 * @file Prefer arrow functions.
 */
module.exports = {
  plugins: ["prefer-arrow"],
  rules: {
    "prefer-arrow/prefer-arrow-functions": [
      "off",
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],
  },
};
