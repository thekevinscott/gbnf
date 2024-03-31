import {
  InternalRuleType,
  isRuleDefAlt,
  isRuleDefChar,
  isRuleDefCharAlt,
  isRuleDefCharRngUpper,
  isRuleDefEnd,
  isRuleDefRef,
  type InternalRuleDef,
  type InternalRuleDefWithNumericValue,
} from "../rules-builder/types.js";
import {
  GraphRule,
  RuleChar,
  RuleRef,
  RuleType,
  isRuleChar,
  isRuleEnd,
  isRuleRange,
  type RuleRange,
} from "./graph/types.js";

const getNumericValue = (rule: RuleChar): number => {
  const value = rule.value;
  if (!Array.isArray(value)) {
    throw new Error(`Expected value to be an array, but got: ${JSON.stringify(value)}`);
  }
  if (value.length !== 1) {
    throw new Error(`For building ranges, a single value is expected. We received: ${JSON.stringify(value)}`);
  }
  return value[0];
};

// Function to build a regex rule
const buildRangeRule = (prevRule: RuleChar, currentRule: InternalRuleDefWithNumericValue): RuleRange => {
  return {
    type: RuleType.RANGE,
    value: [[getNumericValue(prevRule), currentRule.value,],],
  };
};

export const buildRuleStack = (linearRules: InternalRuleDef[]): GraphRule[][] => {
  let paths: GraphRule[] = [];

  const stack: GraphRule[][] = [];

  let idx = 0;
  while (idx < linearRules.length) {
    const ruleDef = linearRules[idx];
    if (isRuleDefAlt(ruleDef)) {
      if (paths.length) {
        paths.push({ type: RuleType.END, });
        stack.push(paths);
        paths = [];
      }
    } else if (isRuleDefCharAlt(ruleDef)) {
      const previousRule: InternalRuleDef = linearRules[idx - 1];
      if (isRuleDefCharRngUpper(previousRule)) {
        // exhaust this sequence of CHAR_ALT and CHAR_RNG_UPPER rules

        let prevValue: number = ruleDef.value;
        idx += 1;
        while (idx < linearRules.length && (isRuleDefCharRngUpper(linearRules[idx]) || isRuleDefChar(linearRules[idx]))) {
          const rule = linearRules[idx];
          if (prevValue !== undefined && !isRuleDefCharRngUpper(rule)) {
            throw new Error(`Unexpected sequence, expected a CHAR_RNG_UPPER rule but got ${rule.type}`);
          }

          switch (rule.type) {
            case InternalRuleType.CHAR:
              throw new Error('Should never get here');
            case InternalRuleType.CHAR_ALT:
              prevValue = rule.value;
              break;
            case InternalRuleType.CHAR_RNG_UPPER:
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
      } else if (isRuleDefChar(previousRule)) {
        let currentCharAlt = linearRules[idx];
        while (idx < linearRules.length && isRuleDefCharAlt(currentCharAlt)) {
          previousRule.value.push(currentCharAlt.value);
          idx += 1;
          currentCharAlt = linearRules[idx];
        }
        // decrement by 1, to account for the last increment at the end of the while loop
        idx -= 1;
      } else {
        throw new Error(`Unexpected previous rule: ${JSON.stringify(previousRule)}, expected CHAR or CHAR_ALT`);
      }

    } else if (isRuleDefCharRngUpper(ruleDef)) {
      const prevRule: GraphRule = paths.pop();
      if (isRuleChar(prevRule)) {
        paths.push(buildRangeRule(prevRule, ruleDef));
      } else {
        throw new Error(`Unexpected previous rule: ${JSON.stringify(prevRule)}, expected CHAR or CHAR_ALT`);
      }
    } else if (isRuleDefChar(ruleDef)) {
      paths.push({
        type: RuleType.CHAR,
        value: ruleDef.value,
      });
    } else if (isRuleDefEnd(ruleDef)) {
      // } else if (isRuleDefEnd(ruleDef)) {
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
  if (!isRuleEnd(paths[paths.length - 1])) {
    paths.push({ type: RuleType.END, });
  }

  stack.push(paths);

  return stack;
};
