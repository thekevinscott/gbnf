import { GraphRule, isGraphRule, isRuleChar, isRuleRef, } from "./types.js";

export const getSerializedRuleKey = (rule: GraphRule) => {
  if (isGraphRule(rule)) {
    if (isRuleChar(rule)) {
      return `${rule.type}-${rule.value.join(',')}`;
    }
    if (isRuleRef(rule)) {
      return `${rule.type}-${rule.value}`;
    }
    return rule.type;
  }
  return JSON.stringify(rule);
};
