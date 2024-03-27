import { Rule, RulePointer, RuleType, } from "../types.js";

export const getRulePosition = (stacks: Rule[][][], stackPos: number): RulePointer => {
  const stack = stacks[stackPos];
  return stack.map((_, pathPos) => {
    const rule = stack[pathPos][0];
    if (rule.type === RuleType.RULE_REF) {
      return getRulePosition(stacks, rule.value);
    }
    return {
      stackPos,
      pathPos,
      rulePos: 0,
    };
  });
};
