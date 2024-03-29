import type { Rule, } from "../../types.js";
import { GraphNode, } from "./graph-node.js";
import type { GraphPointer, } from "./graph-pointer.js";
import type { Graph, } from "./graph.js";

export class GraphRootNode {
  stackId: number;
  nodes = new Map<number, GraphNode>();
  graph: Graph;
  constructor(graph: Graph, stack: Rule[][], stackId: number) {
    this.graph = graph;
    this.stackId = stackId;
    for (let pathId = 0; pathId < stack.length; pathId++) {
      this.nodes.set(pathId, new GraphNode(graph, stack, stackId, pathId, 0));
    }
  }

  print = (pointers: Set<GraphPointer>, showPosition = false): string => {
    const nodes = Array.from(this.nodes.values()).map(node => {
      return '  ' + node.print(pointers, showPosition);
    });
    return ` (`.blue + `${this.stackId}`.gray + `)\n`.blue + nodes.join('\n');
  };

  get next(): Iterable<GraphNode> {
    return this.nodes.values();
  }
}

