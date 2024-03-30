import { Col, PrintOpts, isRuleDefEnd, isRuleDefRef as isRuleDefRef, } from "../../types.js";
import { Color, } from "./color.js";
import { GraphNode, } from "./graph-node.js";
import type { Graph, } from "./graph.js";

export class GraphPointer {
  #node: GraphNode;
  graph: Graph;
  parent?: GraphPointer;

  constructor(graph: Graph, node: GraphNode, parent?: GraphPointer) {
    this.graph = graph;
    this.#node = node;
    node.pointer = this;

    this.parent = parent;
  }

  get node() {
    return this.#node;
  }
  set node(node: GraphNode) {
    throw new Error('do not do this, node should be immutable')
    // // remove the old node's pointer reference
    // this.node.deletePointer(this);

    // // point to the new node and update the pointer reference
    // this._node = node;
    // node.pointer = this;
  }

  * nextNodes(): IterableIterator<{ node: GraphNode; parent?: GraphPointer; }> {
    for (const node of this.node.nextNodes()) {
      if (isRuleDefRef(node.rule)) {
        // console.log(`is rule ref "${node.rule.value}" `, node.stackId, node.pathId, node.stepId)
        for (const { node: next, } of this.graph.fetchNodesForRootNode(this.graph, this.graph.getRootNode(node.rule.value), this)) {
          // console.log(`rule ref "${node.rule.value}" `, 'has resolved to', next.stackId, next.pathId, next.stepId)
          // console.log('yield a parent of this', this.node.stackId, this.node.pathId, this.node.stepId)

          if (isRuleDefEnd(next.rule)) {
            // console.log('this is an ending rule, resolve to something else')
            // we _know_ that this cannot be a terminal node, because it's referenced from a rule ref
            // so, we can safely yield the parent of this node
            if (this.parent) {
              // console.log('parent', this.parent.node.stackId, this.parent.node.pathId, this.parent.node.stepId);
              yield* this.parent.nextNodes();
            } else {
              // throw new Error('no parent???')
              yield { node: next, };
            }





            // console.log('ending node!')
            // // console.log('current!', node.stackId, node.pathId, node.stepId)
            // if (next.parent) {
            // //   console.log('parent', this.parent.node.stackId, this.parent.node.pathId, this.parent.node.stepId);
            // //   // console.log('parent', this.parent instanceof GraphPointer, this.parent instanceof GraphNode);
            // //   for (const { node: next, parent, } of this.parent.nextNodes()) {
            // //     yield { node: next, parent, };
            // //   }
            // //   // yield* this.parent.nextNodes();
            // } else {
            //   console.log('<TERMINAL NODE>')
            //   yield { node: next, };
            // }
          } else {
            yield { node: next, parent: new GraphPointer(this.graph, node, this.parent), };
          }
        }
        // yield* this.graph.fetchNodesForRootNode(
        //   this.graph,
        //   this.graph.getRootNode(node.rule.value),
        //   // TODO: Now we could run into the issue where this pointer continues to exist, and has
        //   // a reference to a node, but the node no longer has a reference to it. I don't know
        //   // if that will cause a bug down the line.
        //   this,
        //   // new GraphPointer(this.graph, node, this),
        // );
        // yield* this.fetchNodesForRootNode(graph, graph.getRootNode(node.rule.value), new GraphPointer(this, node, parent));
        // throw new Error('Encountered a reference rule in the graph, this should not happen')
        // yield { node, parent: this, };
      } else if (isRuleDefEnd(node.rule)) {
        // console.log('end node!')
        // console.log('current!', node.stackId, node.pathId, node.stepId)
        if (this.parent) {
          // console.log('parent', this.parent.node.stackId, this.parent.node.pathId, this.parent.node.stepId);
          // console.log('parent', this.parent instanceof GraphPointer, this.parent instanceof GraphNode);
          for (const { node: next, parent, } of this.parent.nextNodes()) {
            yield { node: next, parent, };
          }
          // yield* this.parent.nextNodes();
        } else {
          // console.log('<TERMINAL NODE>')
          yield { node, };
        }
      } else {
        // console.log('yo')
        yield { node, parent: this.parent, };
        // yield { node, };
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

  print = ({ col, }: PrintOpts): string => {
    return col(`*${getParentStackId(this, col)}`, Color.RED);
  };
}


const getParentStackId = (pointer: GraphPointer, col: Col): string => {
  const stackIds: string[] = [];
  let parent: undefined | GraphPointer = pointer.parent;
  while (parent) {
    const { node: { stackId, pathId, stepId, }, } = parent;
    // stackIds.push(`${parent.node.stackId}`);
    stackIds.push(`${stackId},${pathId},${stepId}`);
    parent = parent.parent;
  }
  return stackIds.map(id => col(id, Color.RED)).join(col('<-', Color.GRAY));
};
