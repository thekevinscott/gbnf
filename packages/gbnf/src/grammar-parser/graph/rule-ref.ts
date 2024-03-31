import type { GraphNode, } from "./graph-node.js";
import type { Graph, } from "./graph.js";
import { RuleType, } from "./types.js";

export class RuleRef {
  type = RuleType.REF;
  #graph?: Graph;
  constructor(public value: number) { }

  set graph(graph: Graph) {
    this.#graph = graph;
  }

  * getReferencedRules(): IterableIterator<GraphNode> {
    if (!this.#graph) {
      throw new Error('Graph not set on RuleRef');
    }

    for (const { node, } of this.#graph.fetchNodesForRootNode(this.#graph, this.#graph.getRootNode(this.value))) {
      yield node;
    }
  }
}
