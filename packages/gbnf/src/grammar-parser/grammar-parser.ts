import { Rule, RulePointer, RuleType, SymbolIds, } from "../types.js";
import { AbstractGrammarParser, } from "./abstract-grammar-parser.js";
import { buildRuleStack, } from "./build-rule-stack.js";
import { fetchRules, } from "./fetch-rules.js";
import { getRulePosition, } from "./get-rule-position.js";
import { hasValidRules, } from "./has-valid-rules.js";
import { isPointInRange, } from "./is-point-in-range.js";


export const getGrammarParser = (ruleDefs: Rule[][], symbolIds: SymbolIds) => {
  class _GrammarParser implements AbstractGrammarParser {
    ruleDefs = ruleDefs;
    symbolIds = symbolIds;
    stacks = ruleDefs.map(buildRuleStack);

    rulePointer: RulePointer;

    constructor(src: string) {
      const rootId = this.symbolIds.get('root');
      this.rulePointer = getRulePosition(this.stacks, rootId);
      // for (const rules of this.ruleDefs) {
      //   for (const rule of rules) {
      //     this.ruleSet.add(rule);
      //   }
      // }
      this.add(src);
    }

    public add = (src: string) => {
      let strPos = 0;
      const updateRulePointers = (_pointer: RulePointer, depth = 0): RulePointer => {
        let rulePointerIdx = 0;
        while (rulePointerIdx < _pointer.length) {
          const pointer = _pointer[rulePointerIdx];
          if (Array.isArray(pointer)) {
            _pointer[rulePointerIdx] = updateRulePointers(pointer, depth + 1);
            rulePointerIdx++;
          } else {
            const { stackPos, pathPos, rulePos, } = pointer;
            const rule = this.stacks[stackPos][pathPos][rulePos];
            if (rule === undefined) {
              throw new Error('Out of bounds rule');
            }
            const char = src[strPos];
            if (rule.type === RuleType.CHAR) {
              const ruleChar = String.fromCharCode(rule.value);
              const valid = char === ruleChar;
              if (!valid) {
                _pointer = _pointer.filter((_, i) => i !== rulePointerIdx); // remove this rule
              } else {
                _pointer[rulePointerIdx] = {
                  stackPos,
                  pathPos,
                  rulePos: rulePos + 1,
                };
                rulePointerIdx++;
              }
            } else if (rule.type === RuleType.RANGE) {
              const charCodePoint = src.charCodeAt(strPos);
              const valid = isPointInRange(charCodePoint, rule.value);
              if (!valid) {
                _pointer = _pointer.filter((_, i) => i !== rulePointerIdx); // remove this rule
              } else {
                const nextRule = this.stacks[stackPos][pathPos][rulePos + 1];
                if (nextRule.type === RuleType.RULE_REF) {
                  _pointer[rulePointerIdx] = getRulePosition(this.stacks, nextRule.value);
                } else {
                  _pointer[rulePointerIdx] = {
                    stackPos,
                    pathPos,
                    rulePos: rulePos + 1,
                  };
                }
                rulePointerIdx++;
              }
            } else if (rule.type === RuleType.END) {

              if (rulePos + 1 < this.stacks[stackPos][pathPos].length) {
                _pointer[rulePointerIdx] = {
                  stackPos,
                  pathPos,
                  rulePos: rulePos + 1,
                };
                rulePointerIdx++;
              } else {
                _pointer = _pointer.filter((_, i) => i !== rulePointerIdx); // reached the end of this path, remove it
              }

            } else {
              throw new Error(`Unsupported rule type: ${rule.type}`);
            }
          }
        }
        return _pointer;
      };
      while (strPos < src.length) {
        if (hasValidRules(this.rules) === false) {
          throw new Error('Invalid input string, cannot be parsed');
        }
        this.rulePointer = updateRulePointers(this.rulePointer);
        strPos++;
      }

      if (hasValidRules(this.rules) === false) {
        throw new Error('Invalid input string, cannot be parsed');
      }
    };

    // returns a flat stack of rules
    get rules(): Rule[] {
      return fetchRules(this.stacks, this.rulePointer).rules;
    }
  }

  return _GrammarParser;
};
