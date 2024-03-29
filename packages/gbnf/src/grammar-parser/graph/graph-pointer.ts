import { isRuleEnd, } from "../../types.js";
import type { GraphNode, } from "./graph-node.js";
import type { Graph, } from "./graph.js";

export class GraphPointer {
  _node: GraphNode;
  graph: Graph;
  parent?: GraphNode;

  constructor(graph: Graph, node: GraphNode, parent?: GraphNode) {
    this.graph = graph;
    this._node = node;
    this.parent = parent;
  }

  get node() {
    return this._node;
  }
  set node(node: GraphNode) {
    // remove the old node's pointer reference
    this.node.deletePointer(this);

    // point to the new node and update the pointer reference
    this._node = node;
    node.pointer = this;
  }

  * nextNodes(): IterableIterator<{ node: GraphNode; parent?: GraphNode; }> {
    for (const { node, parent, } of this.node.nextNodes()) {
      if (isRuleEnd(node.rule)) {
        if (this.parent) {
          yield* this.parent.nextNodes();
        } else {
          yield { node, };
        }
      } else {
        yield { node, parent: parent || this.parent, };
      }
    }
  }

  get rule() {
    return this.node.rule;
  }

  set valid(valid: boolean) {
    if (!valid) {
      this.graph.pointers.delete(this);
    }
  }

  static delete(pointers: Set<GraphPointer>, pointer: GraphPointer) {
    pointers.delete(pointer);
    // TODO: Fix this
    try {
      pointer.node.deletePointer(pointer);
    } catch (err) { }
  }
}
