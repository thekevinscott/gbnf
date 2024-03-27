import { Rule, RuleType, RuleWithRangeValues, RuleWithNumericValue, isRuleChar, isRuleCharRngUpper, isRuleRange, isRuleCharAlt, } from "../types.js";



// Function to build a regex rule
const buildRangeRule = (prevRule: RuleWithNumericValue, currentRule: RuleWithNumericValue): RuleWithRangeValues => ({
  type: RuleType.RANGE,
  value: [[prevRule.value, currentRule.value,],],
});

export const buildRuleStack = (linearRules: Rule[]): Rule[][] => {
  let paths: Rule[] = [];

  const stack: Rule[][] = [];

  let idx = 0;
  while (idx < linearRules.length) {
    const ruleDef = linearRules[idx];
    if ([RuleType.ALT,].includes(ruleDef.type)) {
      if (paths.length) {
        paths.push({ type: RuleType.END, });
        stack.push(paths);
        paths = [];
      }
    } else if (isRuleCharAlt(ruleDef)) {
      // exhaust this sequence of CHAR_ALT and CHAR_RNG_UPPER rules

      let prevValue: number = ruleDef.value;
      idx += 1;
      while (idx < linearRules.length && (isRuleCharRngUpper(linearRules[idx]) || isRuleChar(linearRules[idx]))) {
        const rule = linearRules[idx];
        if (prevValue !== undefined && !isRuleCharRngUpper(rule)) {
          throw new Error(`Unexpected sequence, expected a CHAR_RNG_UPPER rule but got ${rule.type}`);
        }

        switch (rule.type) {
          case RuleType.CHAR:
            throw new Error('Should never get here');
          case RuleType.CHAR_ALT:
            prevValue = rule.value;
            break;
          case RuleType.CHAR_RNG_UPPER:
            const prevRule = paths.pop();
            if (!isRuleRange(prevRule)) {
              throw new Error(`Unexpected previous rule: ${JSON.stringify(prevRule)}`);
            }
            prevRule.value.push([prevValue, rule.value,]);
            paths.push(prevRule);
            prevValue = undefined;
            break;
          default:
            throw new Error('Should never get here');
        }

        idx += 1;
      }

      // decrement by 1, to account for the last increment at the end of the while loop
      idx -= 1;

      if (prevValue !== undefined) {
        throw new Error(`Unexpected end of sequence, lingering prev value: ${prevValue}`);
      }

    } else if (ruleDef.type === RuleType.CHAR_RNG_UPPER) {
      const prevRule = paths.pop();
      if (!isRuleChar(prevRule) && !isRuleCharAlt(prevRule)) {
        console.log(idx, linearRules, paths);
        throw new Error(`Unexpected previous rule: ${JSON.stringify(prevRule)}, expected CHAR or CHAR_ALT`);
      }
      paths.push(buildRangeRule(prevRule, ruleDef));
    } else {
      paths.push(ruleDef);
    }

    // if (idx === linearRules.length - 1) {
    //   // we are done!
    //   if (paths[paths.length - 1].type !== RuleType.END) {
    //     paths.push({ type: RuleType.END, });
    //   }

    //   stack.push(paths);
    // }

    idx += 1;
  }
  if (paths[paths.length - 1].type !== RuleType.END) {
    paths.push({ type: RuleType.END, });
  }

  stack.push(paths);

  return stack;
};
