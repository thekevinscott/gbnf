import { InternalRuleDef, } from "../rules-builder/types.js";
import { AbstractGrammarParser, } from "./abstract-grammar-parser.js";
import { buildRuleStack, } from "./build-rule-stack.js";
import { InputParseError, } from "./errors.js";
import { Graph, } from "./graph/index.js";
import type { GraphRule, } from "./graph/types.js";

export const getGrammarParser = (ruleDefs: InternalRuleDef[][], rootId: number) => {
  const stackedRules: GraphRule[][][] = ruleDefs.map(buildRuleStack);
  class _GrammarParser implements AbstractGrammarParser {
    #graph: Graph;

    constructor(src: string) {
      this.#graph = new Graph(stackedRules, rootId);
      // console.log(this.#graph)
      // console.log('------------------')
      this.add(src);
    }

    public add = (src: string) => {
      for (let strPos = 0; strPos < src.length; strPos++) {
        this.#graph.parse(src.charCodeAt(strPos));
        if (this.#graph.rules.length === 0) {
          throw new InputParseError(src, strPos);
        }
      }

    };

    // returns a flat stack of rules
    get rules(): GraphRule[] { return this.#graph.rules; }
  }

  return _GrammarParser;
};
