// eslint-disable-next-line unused-imports/no-unused-vars
const { Yarn } = require("@yarnpkg/types");

const rules = require("./rules.js").default;

/**
 * @param {Yarn.Constraints.Yarn} yarn
 * @param {keyof typeof rules} rulekey
 */
const rulesSwitch = (yarn, rulekey) => {
  if (!rules[rulekey]) {
    return;
  }
  if (rules[rulekey].checked) {
    return;
  }
  return rules[rulekey].fn(yarn);
};

/** @type {(keyof typeof rules)[]} */
// @ts-ignore - wrong!
const AllRules = Object.keys(rules);

/**
 * @param {Yarn.Constraints.Yarn} yarn
 */
module.exports.fixRules = (yarn) => {
  for (const rulekey of AllRules) {
    rulesSwitch(yarn, rulekey);
  }
};
