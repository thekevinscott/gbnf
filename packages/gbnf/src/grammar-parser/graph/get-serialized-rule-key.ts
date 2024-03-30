import { GraphRule, isRuleChar, isRuleRange, isRuleRef, } from "./types.js";

export const getSerializedRuleKey = (rule: GraphRule) => {
  if (isRuleRange(rule)) {
    return `${rule.type}-${JSON.stringify(rule.value)}`;
  }
  if (isRuleChar(rule)) {
    return `${rule.type}-${rule.value.join(',')}`;
  }
  if (isRuleRef(rule)) {
    return `${rule.type}-${rule.value}`;
  }
  return rule.type;
};
