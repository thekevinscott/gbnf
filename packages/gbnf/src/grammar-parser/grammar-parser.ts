import { RuleDef, RuleType, SymbolIds, isRuleDef, isRuleDefChar, isRuleDefEnd, isRuleDefRange, } from "../types.js";
import { AbstractGrammarParser, } from "./abstract-grammar-parser.js";
import { InputParseError, } from "./errors.js";
import { Graph, } from "./graph/index.js";
import { isRuleChar, isRuleEnd, isRuleRange } from "./graph/rule.js";
import { isPointInRange, } from "./is-point-in-range.js";

export const getGrammarParser = (ruleDefs: RuleDef[][], symbolIds: SymbolIds) => {
  const rootId = symbolIds.get('root');
  class _GrammarParser implements AbstractGrammarParser {
    #graph: Graph;

    constructor(src: string) {
      this.#graph = new Graph(ruleDefs, rootId);
      // console.log(this.#graph)
      // console.log('------------------')
      this.add(src);
    }

    public add = (src: string) => {
      for (let strPos = 0; strPos < src.length; strPos++) {
        const char = src[strPos];
        // console.log('char', char);
        for (const ruleWrapper of this.#graph) {
          const rule = ruleWrapper.rule;
          if (isRuleDefChar(rule)) {
            const valid = rule.value.reduce((isValid, charCodePoint) => {
              if (isValid) {
                return true;
              }
              const ruleChar = String.fromCharCode(charCodePoint);
              return ruleChar === char;
            }, false);
            ruleWrapper.valid = valid;
          } else if (isRuleDefRange(rule)) {
            const charCodePoint = src.charCodeAt(strPos);
            const valid = isPointInRange(charCodePoint, rule.value);
            ruleWrapper.valid = valid;
          } else if (isRuleDefEnd(rule)) {
            // console.log('end');
            // do nothing with this
          } else {
            throw new Error(`Unsupported rule type: ${rule.type}`);
          }
        }
        // console.log(char)
        // console.log(this.#graph)
        // console.log('------------------')
        if (this.#graph.rules.length === 0) {
          throw new InputParseError(src, strPos);
        }
      }

    };

    // returns a flat stack of rules
    get rules(): RuleDef[] { return this.#graph.rules; }
  }

  return _GrammarParser;
};
