import { GraphRule, } from "./graph/types.js";

export abstract class AbstractGrammarParser {
  public abstract add(src: string): void;
  abstract get rules(): GraphRule[];
}
