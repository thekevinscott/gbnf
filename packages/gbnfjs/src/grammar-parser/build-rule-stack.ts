import {
  InternalRuleDefChar,
  InternalRuleDefCharNot,
  isRuleDefAlt,
  isRuleDefChar,
  isRuleDefCharAlt,
  isRuleDefCharNot,
  isRuleDefCharRngUpper,
  isRuleDefEnd,
  isRuleDefRef,
  type InternalRuleDef,
} from "../rules-builder/types.js";
import { RuleRef, } from "../grammar-graph/rule-ref.js";
import {
  UnresolvedRule,
  RuleChar,
  RuleCharExclude,
  RuleType,
  isRange,
  isRuleEnd,
} from "../grammar-graph/types.js";

function makeCharRule<R extends (InternalRuleDefChar | InternalRuleDefCharNot)>(ruleDef: R): R extends InternalRuleDefChar ? RuleChar : RuleCharExclude {
  return {
    type: isRuleDefCharNot(ruleDef) ? RuleType.CHAR_EXCLUDE : RuleType.CHAR,
    value: [...ruleDef.value,],
  } as R extends InternalRuleDefChar ? RuleChar : RuleCharExclude;
}

export const buildRuleStack = (linearRules: InternalRuleDef[]): UnresolvedRule[][] => {
  let paths: UnresolvedRule[] = [];

  const stack: UnresolvedRule[][] = [];

  let idx = 0;
  while (idx < linearRules.length) {
    const ruleDef = linearRules[idx];
    if (isRuleDefChar(ruleDef) || isRuleDefCharNot(ruleDef)) {
      // this could be a single char, or a range, or a sequence of alts; we don't know until we step through it.
      const charRule = makeCharRule(ruleDef);
      idx += 1;
      let rule = linearRules[idx];
      while (idx < linearRules.length && (isRuleDefCharRngUpper(rule) || isRuleDefCharAlt(rule))) {
        if (isRuleDefCharRngUpper(rule)) {
          // previous rule value should be a number
          const prevValue = charRule.value.pop();
          if (isRange(prevValue)) {
            throw new Error(`Unexpected range, expected a number but got an array: ${JSON.stringify(prevValue)}`);
          }
          charRule.value.push([
            prevValue,
            rule.value,
          ]);
        }
        if (isRuleDefCharAlt(rule)) {
          charRule.value.push(rule.value);
        }
        idx += 1;
        rule = linearRules[idx];
      }
      paths.push(charRule);
    } else {
      if (isRuleDefAlt(ruleDef)) {
        if (!paths.length) {
          throw new Error('Encountered alt without anything before it');
        }
        paths.push({ type: RuleType.END, });
        stack.push(paths);
        paths = [];
      } else if (isRuleDefEnd(ruleDef)) {
        paths.push({
          type: RuleType.END,
        });
      } else if (isRuleDefRef(ruleDef)) {
        paths.push(new RuleRef(ruleDef.value));
      } else {
        throw new Error(`Unsupported rule type: ${ruleDef.type}`);
      }
      idx += 1;
    }

  }
  if (!isRuleEnd(paths[paths.length - 1])) {
    paths.push({ type: RuleType.END, });
  }

  stack.push(paths);

  return stack;
};
