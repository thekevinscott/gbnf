import { Color, Colorize, } from "./colorize.js";
import { GraphNode, } from "./graph-node.js";
import { GraphRule, Rule, RuleChar, RuleEnd, RuleRange, RuleRef, isRuleChar, isRuleEnd, isRuleRange, isRuleRef, type PrintOpts, } from "./types.js";

export type VisibleGraphPointer = GraphPointer<Rule>;
const isGraphPointerRuleRef = (pointer: GraphPointer): pointer is GraphPointer<RuleRef> => isRuleRef(pointer.rule);
const isGraphPointerRuleEnd = (pointer: GraphPointer): pointer is GraphPointer<RuleEnd> => isRuleEnd(pointer.rule);
const isGraphPointerRuleChar = (pointer: GraphPointer): pointer is GraphPointer<RuleChar> => isRuleChar(pointer.rule);
const isGraphPointerRuleRange = (pointer: GraphPointer): pointer is GraphPointer<RuleRange> => isRuleRange(pointer.rule);

export class GraphPointer<R extends GraphRule = GraphRule> {
  node: GraphNode<R>;
  parent?: GraphPointer;
  #valid?: boolean;

  constructor(node: GraphNode<R>, parent?: GraphPointer) {
    if (node === undefined) {
      throw new Error('Node is undefined');
    }
    this.node = node;
    this.parent = parent;
  }

  *resolve(resolved = false): IterableIterator<VisibleGraphPointer> {
    if (isGraphPointerRuleRef(this)) {
      if (resolved) {
        const nextPointer = new GraphPointer(this.node.next, this.parent);
        yield* nextPointer.resolve();
      } else {
        for (const node of this.node.rule.nodes) {
          const nextPointer = new GraphPointer(node, this);
          yield* nextPointer.resolve();
        }
      }
    } else if (isGraphPointerRuleEnd(this)) {
      if (!this.parent) {
        yield this;
      } else {
        yield* this.parent.resolve(true);
      }
    } else if (isGraphPointerRuleChar(this) || isGraphPointerRuleRange(this)) {
      yield this;
    } else {
      throw new Error(`Unknown rule type: ${this.node.rule.type}`);
    }
  }

  // method for fetching the next pointer. 
  *fetchNext(): IterableIterator<VisibleGraphPointer> {
    if (this.#valid === false) {
      return;
    }
    /*
     * 1. If the current node is an end node, and the pointer has a parent, return the parent's `fetchNext`; else return nothing.
     * 2. If the current node is a rule ref, yield the referenced nodes, _unless_ resolved is true, in which case it returns next.
     * 3. If the current node is a char or range, we go to the next node. If none exists, throw an error.
     */

    // if (isRuleRef(this.node.rule)) {
    //   for (const referencedNode of this.node.rule.nodes) {
    //     yield new GraphPointer(referencedNode, this);
    //   }
    // }

    // if (!isRuleEnd(this.node.rule) && !isRuleRef(this.node.rule)) {
    // if (isRuleChar(this.node.rule) || isRuleRange(this.node.rule)) {
    if (isRuleEnd(this.node.rule)) {
      if (this.parent) {
        yield* this.parent.fetchNext();
      }
    } else {
      const nextPointer = new GraphPointer(this.node.next, this.parent);
      yield* nextPointer.resolve();
    }
    //   if (isRuleChar(this.node.next.rule) || isRuleRange(this.node.next.rule)) {
    //     // 
    //     const nextPointer = new GraphPointer(this.node.next, this.parent);
    //     yield* nextPointer.resolve();
    //   } else if (isRuleRef(this.node.next.rule)) {
    //     for (const next of this.node.next.rule.nodes) {
    //       const nextPointer = new GraphPointer(next, this);
    //       yield* nextPointer.fetchNext();
    //       // yield nextPointer;
    //     }
    //     // for (const next of this.node.next.rule.nodes) {
    //     //   if (isRuleEnd(next.rule)) {
    //     //     if (this.parent) {
    //     //       // yield* this.parent.fetchNext();
    //     //     } else {
    //     //       yield new GraphPointer(next);
    //     //     }
    //     //   } else {
    //     //     // yield new GraphPointer(next, new GraphPointer(this.node, this.parent));
    //     //   }
    //     // }
    //   } else if (isRuleEnd(this.node.next.rule)) {
    //     if (this.parent) {
    //       yield* this.parent.fetchNext();
    //     }
    //   }
    // // }

    // const node = this.node.next;
    // if (node) {
    //   if (isRuleRef(node.rule)) {
    //     for (const next of node.rule.nodes) {
    //       if (isRuleEnd(next.rule)) {
    //         if (this.parent) {
    //           yield* this.parent.fetchNext();
    //         } else {
    //           yield new GraphPointer(next);
    //         }
    //       } else {
    //         yield new GraphPointer(next, new GraphPointer(node, this.parent));
    //       }
    //     }
    //   } else if (isRuleEnd(node.rule)) {
    //     if (this.parent) {
    //       for (const { node: next, parent, } of this.parent.fetchNext()) {
    //         yield new GraphPointer(next, parent);
    //       }
    //     } else {
    //       yield new GraphPointer(node);
    //     }
    //   } else {
    //     yield new GraphPointer(node, this.parent);
    //   }
    // }
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
