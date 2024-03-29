import { Rule, SymbolIds, isRuleChar, isRuleEnd, isRuleRange, } from "../types.js";
import { AbstractGrammarParser, } from "./abstract-grammar-parser.js";
import { Graph, } from "./graph/index.js";
import { isPointInRange, } from "./is-point-in-range.js";

export const getGrammarParser = (ruleDefs: Rule[][], symbolIds: SymbolIds) => {
  const rootId = symbolIds.get('root');
  class _GrammarParser implements AbstractGrammarParser {
    #graph: Graph;

    constructor(src: string) {
      this.#graph = new Graph(ruleDefs, rootId);
      this.add(src);
    }

    public add = (src: string) => {
      for (let strPos = 0; strPos < src.length; strPos++) {
        if (this.#graph.rules.length === 0) {
          break;
        }
        const char = src[strPos];
        for (const { pointer, rule, } of this.#graph) {
          if (isRuleChar(rule)) {
            const ruleChar = String.fromCharCode(rule.value[0]);
            pointer.valid = char === ruleChar;
          } else if (isRuleRange(rule)) {
            const charCodePoint = src.charCodeAt(strPos);
            pointer.valid = isPointInRange(charCodePoint, rule.value);
          } else if (isRuleEnd(rule)) {
            // do nothing with this
          } else {
            throw new Error(`Unsupported rule type: ${rule.type}`);
          }
        }
      }

      if (this.#graph.rules.length === 0) {
        throw new Error('Invalid input string, cannot be parsed');
      }
    };

    // returns a flat stack of rules
    get rules(): Rule[] { return this.#graph.rules; }
  }

  return _GrammarParser;
};
