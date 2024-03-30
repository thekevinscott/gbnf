// import { isRuleDefWithoutValue, RuleType, } from "../../types.js";
// import type { RuleChar, RuleEnd, RuleRange, RuleDef, RuleWithNumericValue, RuleWithoutValue, } from "../../types.js";
import type { RuleDef, } from "../../types.js";
import type { GraphPointer, } from "./graph-pointer.js";

export class RuleWrapper {
  public rule: RuleDef;
  #pointers: GraphPointer[];

  constructor(rule: RuleDef, pointers: GraphPointer[]) {
    this.rule = rule;
    this.#pointers = pointers;
  }

  set valid(valid: boolean) {
    for (const pointer of this.#pointers) {
      pointer.valid = valid;
    }
  }
}
