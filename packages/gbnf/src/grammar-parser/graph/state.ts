import { GenericSet, } from "./generic-set.js";
import { getSerializedRuleKey, } from "./get-serialized-rule-key.js";
import { VisibleGraphPointer, } from "./graph-pointer.js";
import { Graph, } from "./graph.js";
import { Rule, } from "./types.js";

// export class GraphState {
//   #pointers = new Set<VisibleGraphPointer>();

//   *[Symbol.iterator](): IterableIterator<VisibleGraphPointer> {
//     // const rules = new Set<Rule>();
//     for (const pointer of this.#pointers) {
//       // rules.add(rule);
//       yield pointer;
//     }
//     // return Array.from(rules);
//   }

//   rules(): Rule[] {
//     const rules = new GenericSet<Rule, string>(getSerializedRuleKey);

//     for (const { rule, } of this) {
//       rules.add(rule);
//     }
//     return Array.from(rules);
//   }

//   addPointer(pointer: VisibleGraphPointer) {
//     this.#pointers.add(pointer);
//   }

//   deletePointer(pointer: VisibleGraphPointer) {
//     this.#pointers.delete(pointer);
//   }

//   size() {
//     return Array.from(this.#pointers).length;
//   }
// }

export class State {
  #graph: Graph;
  // #state: GraphState;
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

  // deletePointer(pointer: VisibleGraphPointer) {
  //   this.#state.delete(pointer);
  // }

  // size() {
  //   return Array.from(this.#state).length;
  // }
}
