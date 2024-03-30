import { RuleDef, isRuleDefRange, isRuleDefWithNumericValue, } from "../../types.js";

export const getRuleKey = (rule: RuleDef) => {
  if (isRuleDefRange(rule)) {
    return `${rule.type}-${JSON.stringify(rule.value)}`;
  }
  if (isRuleDefWithNumericValue(rule)) {
    return `${rule.type}-${rule.value}`;
  }
  return rule.type;
};
