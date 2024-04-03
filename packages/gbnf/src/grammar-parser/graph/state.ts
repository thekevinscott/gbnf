import type { Graph, } from "./graph.js";
import type { Pointers, } from "./types.js";


export class State {
  #graph: Graph;
  #pointers: Pointers;
  constructor(graph: Graph, pointers: Pointers) {
    this.#graph = graph;
    this.#pointers = pointers;
  }



  rules() {
    return this.#graph.rules();
  }
  // *[Symbol.iterator](): IterableIterator<VisibleGraphPointer> {
  //   const rules = new GenericSet<Rule, string>(getSerializedRuleKey);

  //   for (const { rule, } of this.#state) {
  //     rules.add(rule);
  //   }
  //   return Array.from(rules);
  // }

  add(input: string) {
    this.#graph.add(input);
  }
  size() {
    return Array.from(this.rules()).length;
  }
}
