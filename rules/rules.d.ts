import type { Yarn } from "@yarnpkg/types";

export type Rule =
  | "allVersionsShouldBeClean"
  | "onlyOneVersionWholeProject"
  | "peerDependencyShoulBeWildcard"
  | "peerDependencyShouldBeListedAsDevDependency";

type Rules = Record<Rule, { description: string; checked?: boolean; fn: (yarn: Yarn.Constraints.Yarn) => {} }>;
const Rules: Rules;
export default Rules;
