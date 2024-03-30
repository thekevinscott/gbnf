import type { PrintOpts, GraphRule, } from "./types.js";
import { Color, } from "./colorize.js";
import { GraphNode, } from "./graph-node.js";
import type { Graph, } from "./graph.js";
import { GraphPointersStore, } from "./graph-pointers-store.js";
export class GraphRootNode {
  stackId: number;
  nodes = new Map<number, GraphNode>();
  graph: Graph;
  constructor(graph: Graph, stack: GraphRule[][], stackId: number) {
    this.graph = graph;
    this.stackId = stackId;
    for (let pathId = 0; pathId < stack.length; pathId++) {
      this.nodes.set(pathId, new GraphNode(graph, stack, stackId, pathId, 0));
    }
  }

  print = (pointers: GraphPointersStore, { showPosition = false, colorize: col, }: PrintOpts): string => ([
    [
      col(` (`, Color.BLUE),
      col(this.stackId, Color.GRAY),
      col(`)`, Color.BLUE),
    ].join(''),
    ...Array.from(this.nodes.values()).map(node => {
      return '  ' + node.print(pointers, { showPosition, colorize: col, });
    }),
  ]).join('\n');

  get next(): Iterable<GraphNode> {
    return this.nodes.values();
  }
}

