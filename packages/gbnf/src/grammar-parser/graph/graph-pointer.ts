import { Color, Colorize, } from "./colorize.js";
import { GraphNode, } from "./graph-node.js";
import type { Graph, } from "./graph.js";
import { isRuleEnd, isRuleRef, type PrintOpts, } from "./types.js";

export class GraphPointer {
  #node: GraphNode;
  graph: Graph;
  parent?: GraphPointer;
  #valid?: boolean;

  constructor(graph: Graph, node: GraphNode, parent?: GraphPointer) {
    this.graph = graph;
    this.#node = node;
    this.parent = parent;
  }

  get node() {
    return this.#node;
  }

  * nextNodes(): IterableIterator<{ node: GraphNode; parent?: GraphPointer; }> {
    if (this.#valid === false) {
      return;
    }
    for (const node of this.node.nextNodes()) {
      if (isRuleRef(node.rule)) {
        for (const { node: next, } of this.graph.fetchNodesForRootNode(this.graph, this.graph.getRootNode(node.rule.value), this)) {

          if (isRuleEnd(next.rule)) {
            if (this.parent) {
              yield* this.parent.nextNodes();
            } else {
              yield { node: next, };
            }
          } else {
            yield { node: next, parent: new GraphPointer(this.graph, node, this.parent), };
          }
        }
      } else if (isRuleEnd(node.rule)) {
        if (this.parent) {
          for (const { node: next, parent, } of this.parent.nextNodes()) {
            yield { node: next, parent, };
          }
        } else {
          yield { node, };
        }
      } else {
        yield { node, parent: this.parent, };
      }
    }
  }

  get rule() {
    return this.node.rule;
  }

  set valid(valid: boolean) {
    this.#valid = valid;
  }

  print = ({ colorize: col, }: Omit<PrintOpts, 'pointers' | 'showPosition'>): string => col(`*${getParentStackId(this, col)}`, Color.RED);
}


const getParentStackId = (pointer: GraphPointer, col: Colorize): string => {
  const stackIds: string[] = [];
  let parent: undefined | GraphPointer = pointer.parent;
  while (parent) {
    const { node: { meta: { stackId, pathId, stepId, }, }, } = parent;
    // stackIds.push(`${parent.node.stackId}`);
    stackIds.push(`${stackId},${pathId},${stepId}`);
    parent = parent.parent;
  }
  return stackIds.map(id => col(id, Color.RED)).join(col('<-', Color.GRAY));
};
