import { Rule, SymbolIds, } from "../types.js";

export abstract class AbstractGrammarParser {
  symbolIds: SymbolIds;
  stacks: Rule[][][];
  ruleDefs: Rule[][];

  public abstract add(src: string): void;

  abstract get rules(): Rule[];
}
