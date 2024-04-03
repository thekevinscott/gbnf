import { GenericSet, } from "./generic-set.js";
import { getSerializedRuleKey, } from "./get-serialized-rule-key.js";
import { VisibleGraphPointer, } from "./graph-pointer.js";
import { Rule, } from "./types.js";

export class State {
  #pointers = new Set<VisibleGraphPointer>();

  *[Symbol.iterator](): IterableIterator<VisibleGraphPointer> {
    // const rules = new Set<Rule>();
    for (const pointer of this.#pointers) {
      // rules.add(rule);
      yield pointer;
    }
    // return Array.from(rules);
  }

  rules(): Rule[] {
    const rules = new GenericSet<Rule, string>(getSerializedRuleKey);

    for (const { rule, } of this) {
      rules.add(rule);
    }
    return Array.from(rules);
  }

  add(pointer: VisibleGraphPointer) {
    this.#pointers.add(pointer);
  }

  delete(pointer: VisibleGraphPointer) {
    this.#pointers.delete(pointer);
  }

  size() {
    return Array.from(this.#pointers).length;
  }
}
