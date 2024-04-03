import { GenericSet, } from "./generic-set.js";
import { getSerializedRuleKey, } from "./get-serialized-rule-key.js";
import type { Graph, } from "./graph.js";
import type { Pointers, Rule, } from "./types.js";


export class State {
  #graph: Graph;
  #pointers: Pointers;
  constructor(graph: Graph, pointers: Pointers) {
    this.#graph = graph;
    this.#pointers = pointers;
  }



  rules(): Rule[] {
    const rules = new GenericSet<Rule, string>(getSerializedRuleKey);

    for (const { rule, } of this.#pointers) {
      if (!rules.has(rule)) {
        rules.add(rule);
      }
    }

    return Array.from(rules);
  }
  // *rules(): IterableIterator<Rule> {
  //   const rules = new GenericSet<Rule, string>(getSerializedRuleKey);

  //   for (const { rule, } of this.#pointers) {
  //     if (!rules.has(rule)) {
  //       rules.add(rule);
  //       yield rule;
  //     }
  //   }
  // }
  // *[Symbol.iterator](): IterableIterator<VisibleGraphPointer> {
  //   const rules = new GenericSet<Rule, string>(getSerializedRuleKey);

  //   for (const { rule, } of this.#state) {
  //     rules.add(rule);
  //   }
  //   return Array.from(rules);
  // }

  add(input: string): State {
    const pointers = this.#graph.add(this.#pointers, input);
    return new State(this.#graph, pointers);
  }
  size() {
    return Array.from(this.rules()).length;
  }
}
