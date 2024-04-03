import type { Graph, } from "./graph.js";
import type { Pointers, Rule, } from "./types.js";


export class ParseState {
  #graph: Graph;
  #pointers: Pointers;
  constructor(graph: Graph, pointers: Pointers) {
    this.#graph = graph;
    this.#pointers = pointers;
  }

  *[Symbol.iterator](): IterableIterator<Rule> {
    yield* this.rules();
  }

  *rules(): IterableIterator<Rule> {
    const seen = new Set<string>();
    for (const { rule, } of this.#pointers) {
      const key = JSON.stringify(rule);
      if (!seen.has(key)) {
        seen.add(key);
        yield rule;
      }
    }
  }

  add(input: string): ParseState {
    const pointers = this.#graph.add(input, this.#pointers);
    return new ParseState(this.#graph, pointers);
  }

  size() {
    return Array.from(this.rules()).length;
  }
}
