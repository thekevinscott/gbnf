import { GrammarParser, } from "./grammar-parser.js";

export const GBNF = (grammar: string) => {
  const state = new GrammarParser(grammar);
  if (state.rules.length === 0) {
    throw new Error(`Failed to parse grammar: ${grammar}`);
  }
  if (state.symbolIds.get('root') === undefined) {
    throw new Error("Grammar does not contain a 'root' symbol");
  }
  return state;
};
