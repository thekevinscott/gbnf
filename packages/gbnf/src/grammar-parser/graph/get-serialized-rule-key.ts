import { UnresolvedRule, isRuleChar, isRuleCharExcluded, isRuleEnd, } from "./types.js";

export function getSerializedRuleKey<R extends UnresolvedRule>(rule: R): string {
  if (isRuleEnd(rule)) {
    return `${rule.type}`;
  }

  if (isRuleChar(rule) || isRuleCharExcluded(rule)) {
    return `${rule.type}-${JSON.stringify(rule.value)}`;
  }
  return `${rule.type}-${rule.value}`;
};
