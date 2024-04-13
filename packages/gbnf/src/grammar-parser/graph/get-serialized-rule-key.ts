import {
  type UnresolvedRule,
  isRuleChar,
  isRuleCharExcluded,
  isRuleEnd,
  isRuleRef,
} from "./types.js";

export function getSerializedRuleKey<R extends UnresolvedRule>(rule: R): string {
  if (isRuleEnd(rule)) {
    return `${rule.type}`;
  }

  if (isRuleChar(rule) || isRuleCharExcluded(rule)) {
    return `${rule.type}-${JSON.stringify(rule.value)}`;
  }
  if (isRuleRef(rule)) {
    return `REF-${rule.value}`;
  }
  throw new Error(`Unknown rule type: ${JSON.stringify(rule)}`);
};
