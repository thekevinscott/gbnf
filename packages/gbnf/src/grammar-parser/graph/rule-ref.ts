import type { GraphNode, } from "./graph-node.js";
import { RuleType, } from "./types.js";

export class RuleRef {
  type = RuleType.REF;
  #nodes?: Set<GraphNode>;
  constructor(public value: number) { }

  set nodes(nodes: Set<GraphNode>) {
    this.#nodes = nodes;
  }

  get nodes() {
    if (!this.#nodes) {
      throw new Error('Nodes are not set');
    }

    return this.#nodes;
  }
}
