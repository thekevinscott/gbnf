import { RuleDef, RuleType, SymbolIds, } from "../types.js";
import { buildRuleStack, } from "./build-rule-stack.js";

// type RulePointer = (number | RulePointer)[];

type Pointer = { stackPos: number; pathPos: number; rulePos: number; };
type RulePointer = (Pointer | RulePointer)[];

const getRulePosition = (stacks: RuleDef[][][], stackPos: number): RulePointer => {
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

export const getGrammarParser = (ruleDefs: RuleDef[][], symbolIds: SymbolIds) => {
  class GrammarParser {
    symbolIds: SymbolIds = symbolIds;
    stacks: RuleDef[][][] = ruleDefs.map(buildRuleStack);
    ruleSet = new Set<RuleDef>();
    rulePointer: RulePointer;

    constructor(src: string) {
      const rootId = this.symbolIds.get('root');
      this.rulePointer = getRulePosition(this.stacks, rootId);
      for (const rules of ruleDefs) {
        for (const rule of rules) {
          this.ruleSet.add(rule);
        }
      }
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
            // if (rulePos >= 3) { // second z
            //   console.log('pointer', pointer);
            // }
            const rule = this.stacks[stackPos][pathPos][rulePos];
            if (rule === undefined) {
              throw new Error('Out of bounds rule');
            }
            const char = src[strPos];
            if (rulePos >= 0) {
              console.log(`char (${char}) rule (${rulePos}) for path`, pointer.pathPos, 'is', rule);
            }
            if (rule.type === RuleType.CHAR) {
              const ruleChar = String.fromCharCode(rule.value);
              const valid = char === ruleChar;
              if (!valid) {
                // remove this rule
                _pointer = _pointer.filter((_, i) => i !== rulePointerIdx);
                // delete _pointer[rulePointerIdx];
                // this.rulePointer = this.rulePointer.filter((_, i) => i !== rulePointerIdx);
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
                // remove this rule
                _pointer = _pointer.filter((_, i) => i !== rulePointerIdx);
                // delete _pointer[rulePointerIdx];
                // this.rulePointer = this.rulePointer.filter((_, i) => i !== rulePointerIdx);
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
                // reached the end of this path, remove it
                _pointer = _pointer.filter((_, i) => i !== rulePointerIdx);
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
        console.log(this.rulePointer);
        strPos++;
      }
      // console.log(this.rulePointer[0], this.stacks[0][1]);

      if (hasValidRules(this.rules) === false) {
        throw new Error('Invalid input string, cannot be parsed');
      }
    };

    // returns a flat stack of rules
    get rules(): RuleDef[] {
      const rules = new Map<string, RuleDef>();
      const recur = (rulePointer: RulePointer): void => {
        for (const pointer of rulePointer) {
          if (Array.isArray(pointer)) {
            recur(pointer);
          } else {
            const { stackPos, pathPos, rulePos, } = pointer;
            const stack = this.stacks[stackPos];
            const rule = stack[pathPos][rulePos];
            rules.set(JSON.stringify(rule), rule);
          }
        }
      };
      recur(this.rulePointer);
      return Array.from(rules.values()).filter(Boolean);
    }
  }

  return GrammarParser;
};

const isPointInRange = (point: number, range: number[][]) => {
  return range.reduce((valid, [start, end,]) => {
    if (valid) {
      return valid;
    }
    return point >= start && point <= end;
  }, false);
};

const hasValidRules = (rules: RuleDef[]): boolean => rules.filter(r => r !== undefined).length > 0;
