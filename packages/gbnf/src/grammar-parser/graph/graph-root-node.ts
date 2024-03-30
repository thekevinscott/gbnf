import type { PrintOpts, RuleDef, } from "../../types.js";
import { Color, } from "./color.js";
import { GraphNode, } from "./graph-node.js";
import type { Graph, } from "./graph.js";
import { Pointers, } from "./pointers.js";
export class GraphRootNode {
  stackId: number;
  nodes = new Map<number, GraphNode>();
  graph: Graph;
  constructor(graph: Graph, stack: RuleDef[][], stackId: number) {
    this.graph = graph;
    this.stackId = stackId;
    for (let pathId = 0; pathId < stack.length; pathId++) {
      this.nodes.set(pathId, new GraphNode(graph, stack, stackId, pathId, 0));
    }
  }

  print = (pointers: Pointers, { showPosition = false, col, }: PrintOpts): string => ([
    [
      col(` (`, Color.BLUE),
      col(this.stackId, Color.GRAY),
      col(`)`, Color.BLUE),
    ].join(''),
    ...Array.from(this.nodes.values()).map(node => {
      return '  ' + node.print(pointers, { showPosition, col, });
    }),
  ]).join('\n');

  get next(): Iterable<GraphNode> {
    return this.nodes.values();
  }
}

