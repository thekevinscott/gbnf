import { Rule, SymbolIds, isRuleChar, isRuleEnd, isRuleRange, isRuleWithNumericValue, } from "../types.js";
import { AbstractGrammarParser, } from "./abstract-grammar-parser.js";
import { Graph, } from "./graph.js";
import { isPointInRange, } from "./is-point-in-range.js";
import { RulePointer, } from "./rule-pointer.js";


export const getGrammarParser = (ruleDefs: Rule[][], symbolIds: SymbolIds) => {
  class _GrammarParser implements AbstractGrammarParser {
    ruleDefs = ruleDefs;
    symbolIds = symbolIds;
    // stacks = ruleDefs.map(buildRuleStack);

    rulePointer: RulePointer;
    graph: Graph;

    constructor(src: string) {
      const rootId = this.symbolIds.get('root');
      this.graph = new Graph(this.ruleDefs, rootId);
      // console.log('graph', this.graph);
      this.add(src);
    }

    public add = (src: string) => {
      // console.log('add!', src)
      for (let strPos = 0; strPos < src.length; strPos++) {
        // console.log('strPos', strPos)
        if (this.graph.rules().length === 0) {
          // console.log('break')
          break;
        }
        const char = src[strPos];
        // console.log('char', char);
        for (const { pointer, rule, } of this.graph) {
          // console.log(pointer, rule)
          if (isRuleChar(rule)) {
            const ruleChar = String.fromCharCode(rule.value[0]);
            pointer.valid = char === ruleChar;
          } else if (isRuleRange(rule)) {
            const charCodePoint = src.charCodeAt(strPos);
            pointer.valid = isPointInRange(charCodePoint, rule.value);
          } else if (isRuleEnd(rule)) {
            // do nothing with this
            // if (this.rulePointer.hasNextRule(position)) {
            //   this.rulePointer.increment(position);
            // } else {
            //   this.rulePointer.delete(position);
            // }

          } else {
            throw new Error(`Unsupported rule type: ${rule.type}`);
          }
        }
      }

      if (this.graph.rules().length === 0) {
        throw new Error('Invalid input string, cannot be parsed');
      }
    };

    // returns a flat stack of rules
    get rules(): Rule[] {
      // return this.graph.rules();
      // return this.rulePointer.rules;
      const rules = new Rules();
      for (const rule of this.graph.rules()) {
        rules.add(rule);
      }
      return rules.rules;
    }
  }

  return _GrammarParser;
};

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
