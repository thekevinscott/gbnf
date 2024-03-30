import { getGrammarParser, } from "./grammar-parser/grammar-parser.js";
import { RulesBuilder, } from "./rules-builder/rules-builder.js";

export const GBNF = (grammar: string) => {
  const { rules, symbolIds, } = new RulesBuilder(grammar);
  if (rules.length === 0) {
    throw new Error(`Failed to parse grammar: ${grammar}`);
  }
  if (symbolIds.get('root') === undefined) {
    throw new Error("Grammar does not contain a 'root' symbol");
  }
  const rootId = symbolIds.get('root');

  return getGrammarParser(rules, rootId);
};
