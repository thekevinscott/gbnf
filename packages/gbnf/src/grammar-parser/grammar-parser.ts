import { Rule, SymbolIds, isRuleChar, isRuleEnd, isRuleRange, } from "../types.js";
import { AbstractGrammarParser, } from "./abstract-grammar-parser.js";
import { buildRuleStack, } from "./build-rule-stack.js";
import { hasValidRules, } from "./has-valid-rules.js";
import { isPointInRange, } from "./is-point-in-range.js";
import { RulePointer, } from "./rule-pointer.js";


export const getGrammarParser = (ruleDefs: Rule[][], symbolIds: SymbolIds) => {
  class _GrammarParser implements AbstractGrammarParser {
    ruleDefs = ruleDefs;
    symbolIds = symbolIds;
    stacks = ruleDefs.map(buildRuleStack);

    rulePointer: RulePointer;

    constructor(src: string) {
      const rootId = this.symbolIds.get('root');
      this.rulePointer = new RulePointer(this.stacks, rootId);
      // for (const rules of this.ruleDefs) {
      //   for (const rule of rules) {
      //     this.ruleSet.add(rule);
      //   }
      // }
      this.add(src);
    }

    public add = (src: string) => {
      for (let strPos = 0; strPos < src.length; strPos++) {
        if (hasValidRules(this.rules) === false) {
          throw new Error('Invalid input string, cannot be parsed');
        }
        for (const { rule, position, } of this.rulePointer) {
          const char = src[strPos];
          if (isRuleChar(rule)) {
            const ruleChar = String.fromCharCode(rule.value[0]);
            const valid = char === ruleChar;
            if (!valid) {
              this.rulePointer.delete(position);
            } else {
              this.rulePointer.increment(position);
            }
          } else if (isRuleRange(rule)) {
            const charCodePoint = src.charCodeAt(strPos);
            const valid = isPointInRange(charCodePoint, rule.value);
            if (!valid) {
              this.rulePointer.delete(position);
            } else {
              this.rulePointer.increment(position);
            }
          } else if (isRuleEnd(rule)) {
            if (this.rulePointer.hasNextRule(position)) {
              this.rulePointer.increment(position);
            } else {
              this.rulePointer.delete(position);
            }

          } else {
            throw new Error(`Unsupported rule type: ${rule.type}`);
          }
        }
      }

      if (hasValidRules(this.rules) === false) {
        throw new Error('Invalid input string, cannot be parsed');
      }
    };

    // returns a flat stack of rules
    get rules(): Rule[] {
      return this.rulePointer.rules;
    }
  }

  return _GrammarParser;
};
