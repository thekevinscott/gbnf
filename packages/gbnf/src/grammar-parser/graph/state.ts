import { Graph, } from "./graph.js";


export class State {
  #graph: Graph;
  constructor(graph: Graph) {
    this.#graph = graph;
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
