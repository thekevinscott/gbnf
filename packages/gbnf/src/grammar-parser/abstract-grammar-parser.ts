import { ReturnRuleValue, } from "./graph/types.js";

export abstract class AbstractGrammarParser<StopToken = null> {
  public abstract add(src: string): void;
  abstract get rules(): ReturnRuleValue<StopToken>[];
}
