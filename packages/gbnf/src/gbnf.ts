import { buildRuleStack, } from "./grammar-parser/build-rule-stack.js";
import { Graph, } from "./grammar-parser/graph/graph.js";
// import { getGrammarParser, } from "./grammar-parser/grammar-parser.js";
import { GraphRule, } from "./grammar-parser/graph/types.js";
import { RulesBuilder, } from "./rules-builder/rules-builder.js";

export const GBNF = (grammar: string, initialString = '') => {
  const { rules, symbolIds, } = new RulesBuilder(grammar);
  if (rules.length === 0) {
    throw new Error(`Failed to parse grammar: ${grammar}`);
  }
  if (symbolIds.get('root') === undefined) {
    throw new Error("Grammar does not contain a 'root' symbol");
  }
  const rootId = symbolIds.get('root');

  const stackedRules: GraphRule[][][] = rules.map(buildRuleStack);
  const graph = new Graph(stackedRules, rootId);
  graph.add(initialString);
  return graph.state();
};
