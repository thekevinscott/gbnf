import { Color, Colorize, } from "./colorize.js";
import { GraphNode, } from "./graph-node.js";
import { isRuleEnd, isRuleRef, type PrintOpts, } from "./types.js";

export class GraphPointer {
  node: GraphNode;
  parent?: GraphPointer;
  #valid?: boolean;

  constructor(node: GraphNode, parent?: GraphPointer) {
    if (node === undefined) {
      throw new Error('Node is undefined');
    }
    this.node = node;
    this.parent = parent;
  }

  * nextPointers(): IterableIterator<GraphPointer> {
    if (this.#valid === false) {
      return;
    }
    const node = this.node.next;
    if (node) {
      if (isRuleRef(node.rule)) {
        for (const next of node.rule.getReferencedRules()) {
          if (isRuleEnd(next.rule)) {
            if (this.parent) {
              yield* this.parent.nextPointers();
            } else {
              yield new GraphPointer(next);
            }
          } else {
            yield new GraphPointer(next, new GraphPointer(node, this.parent));
          }
        }
      } else if (isRuleEnd(node.rule)) {
        if (this.parent) {
          for (const { node: next, parent, } of this.parent.nextPointers()) {
            yield new GraphPointer(next, parent);
          }
        } else {
          yield new GraphPointer(node);
        }
      } else {
        yield new GraphPointer(node, this.parent);
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
