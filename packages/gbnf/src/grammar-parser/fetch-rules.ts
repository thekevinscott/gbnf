import { Rule, RulePointer, isRuleRange, isRuleWithNumericValue, } from "../types.js";

// type Rules = Map<string, Rule>;

const getKey = (rule: Rule) => {
  if (isRuleRange(rule)) {
    return `${rule.type}-${JSON.stringify(rule.value)}`;
  }
  if (isRuleWithNumericValue(rule)) {
    return `${rule.type}-${rule.value}`;
  }
  return rule.type;
};

class Rules {
  seen = new Set<string>();
  rules: Rule[] = [];

  add = (rule: Rule) => {
    const key = getKey(rule);
    if (!this.seen.has(key)) {
      this.seen.add(key);
      this.rules.push(rule);
    }
  };
}

export const fetchRules = (stacks: Rule[][][], rulePointer: RulePointer, rules = new Rules()): Rules => {
  for (const pointer of rulePointer) {
    if (Array.isArray(pointer)) {
      fetchRules(stacks, pointer, rules);
    } else {
      const { stackPos, pathPos, rulePos, } = pointer;
      const stack = stacks[stackPos];
      const rule = stack[pathPos][rulePos];
      rules.add(rule);
    }
  }
  return rules;
};
