/** @type {import('@yarnpkg/types')} */

// eslint-disable-next-line unused-imports/no-unused-vars
const { defineConfig, Yarn } = require("@yarnpkg/types");

module.exports = defineConfig({
  async constraints({ Yarn: yarn }) {
    const fix = require("./rules/rules-switch.js").fixRules;
    await fix(yarn);
  },
});
