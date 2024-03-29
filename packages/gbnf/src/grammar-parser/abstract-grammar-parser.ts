import { Rule, } from "../types.js";

export abstract class AbstractGrammarParser {
  // symbolIds: SymbolIds;
  // stacks: Rule[][][];
  // ruleDefs: Rule[][];
  // constructor(_src: string = '') { }

  public abstract add(src: string): void;

  abstract get rules(): Rule[];
}
