import { GrammarParseError, } from "./utils/errors.js";
import { buildRuleStack, } from "./grammar-parser/build-rule-stack.js";
import { Graph, } from "./grammar-graph/graph.js";
import { ParseState, } from "./grammar-graph/parse-state.js";
import { UnresolvedRule, ValidInput, } from "./grammar-graph/types.js";
import { RulesBuilder, } from "./rules-builder/index.js";

export const GBNF = (grammar: string, initialString: ValidInput = ''): ParseState => {
  const { rules, symbolIds, } = new RulesBuilder(grammar);
  if (rules.length === 0) {
    throw new GrammarParseError(grammar, 0, 'No rules were found');
  }
  if (symbolIds.get('root') === undefined) {
    throw new Error("Grammar does not contain a 'root' symbol");
  }
  const rootId = symbolIds.get('root');

  const stackedRules: UnresolvedRule[][][] = rules.map(buildRuleStack);
  const graph = new Graph(grammar, stackedRules, rootId);
  return new ParseState(graph, graph.add(initialString));
};
