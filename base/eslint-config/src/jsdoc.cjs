/**
 * @file EsLint config JSDoc
 */
/**
 * enableError for jsDoc
 * @param {boolean} val - Should error be on?
 * @returns {object} - Configure for eslint
 */
const enableError = (val) => {
  const errorValue = val ? "error" : "off";
  return {
    "jsdoc/check-access": errorValue,
    "jsdoc/check-alignment": errorValue,
    "jsdoc/check-examples": errorValue,
    "jsdoc/check-indentation": errorValue,
    "jsdoc/check-line-alignment": errorValue,
    "jsdoc/check-param-names": errorValue,
    "jsdoc/check-property-names": errorValue,
    "jsdoc/check-tag-names": errorValue,
    "jsdoc/check-types": "off",
    "jsdoc/check-values": errorValue,
    "jsdoc/empty-tags": errorValue,
    "jsdoc/implements-on-classes": errorValue,
    "jsdoc/multiline-blocks": errorValue,
    "jsdoc/no-multi-asterisks": errorValue,
    "jsdoc/no-undefined-types": "off",
    "jsdoc/require-file-overview": errorValue,
    "jsdoc/require-jsdoc": errorValue,
    "jsdoc/require-param": errorValue,
    "jsdoc/require-param-description": errorValue,
    "jsdoc/require-param-name": errorValue,
    "jsdoc/require-param-type": errorValue,
    "jsdoc/require-property": errorValue,
    "jsdoc/require-property-description": errorValue,
    "jsdoc/require-property-name": errorValue,
    "jsdoc/require-property-type": errorValue,
    "jsdoc/require-returns": errorValue,
    "jsdoc/require-returns-check": errorValue,
    "jsdoc/require-returns-description": errorValue,
    "jsdoc/require-returns-type": errorValue,
    "jsdoc/require-throws": errorValue,
    "jsdoc/require-yields": errorValue,
    "jsdoc/require-yields-check": errorValue,
    "jsdoc/tag-lines": errorValue,
    "jsdoc/valid-types": errorValue,
  };
};

module.exports = {
  plugins: ["jsdoc"],
  rules: enableError(false),
  overrides: [
    {
      files: ["*.typespec.*", "*.spec.*"],
      rules: enableError(false),
    },
  ],
};
