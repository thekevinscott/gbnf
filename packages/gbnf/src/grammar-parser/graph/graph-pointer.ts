import { Color, Colorize, } from "./colorize.js";
import { GraphNode, } from "./graph-node.js";
import { RuleRef, } from "./rule-ref.js";
import { GraphRule, Rule, RuleChar, RuleCharExclude, RuleEnd, isRuleChar, isRuleCharExcluded, isRuleEnd, isRuleRef, type PrintOpts, } from "./types.js";

export type PublicGraphPointer = GraphPointer<Rule>;
const isGraphPointerRuleRef = (pointer: GraphPointer): pointer is GraphPointer<RuleRef> => isRuleRef(pointer.rule);
const isGraphPointerRuleEnd = (pointer: GraphPointer): pointer is GraphPointer<RuleEnd> => isRuleEnd(pointer.rule);
const isGraphPointerRuleChar = (pointer: GraphPointer): pointer is GraphPointer<RuleChar> => isRuleChar(pointer.rule);
const isGraphPointerRuleCharExclude = (pointer: GraphPointer): pointer is GraphPointer<RuleCharExclude> => isRuleCharExcluded(pointer.rule);

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

  *resolve(resolved = false): IterableIterator<PublicGraphPointer> {
    /*
     * 1. If the current node is an end node, and the pointer has a parent, return the parent's `fetchNext`; else return nothing.
     * 2. If the current node is a rule ref, yield the referenced nodes, _unless_ resolved is true, in which case it returns next.
     * 3. If the current node is a char or range, we go to the next node. If none exists, throw an error.
     */
    if (isGraphPointerRuleRef(this)) {
      if (resolved) {
        yield* new GraphPointer(this.node.next, this.parent).resolve();
      } else {

        for (const node of this.node.rule.nodes) {
          yield* new GraphPointer(node, this).resolve();
        }
      }
    } else if (isGraphPointerRuleEnd(this)) {
      if (!this.parent) {
        yield this;
      } else {
        yield* this.parent.resolve(true);
      }
    } else if (isGraphPointerRuleChar(this) || isGraphPointerRuleCharExclude(this)) {
      yield this;
    } else {
      throw new Error(`Unknown rule type: ${this.node.rule.type}`);
    }
  }

  *fetchNext(): IterableIterator<PublicGraphPointer> {
    // if this pointer is invalid, then we don't return any new pointers
    if (this.#valid === false) {
      return;
    }

    // if this pointer is an end node, we return the parent's next node. If no parent exists,
    // we return nothing, since it's the end of the line.
    if (isRuleEnd(this.node.rule)) {
      if (this.parent) {
        yield* this.parent.fetchNext();
      }
    } else {
      const pointer = new GraphPointer(this.node.next, this.parent);
      yield* pointer.resolve();
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

export const getPointerKey = ({
  node: {
    id,
    meta: {
      stackId,
      pathId,
      stepId,
    },
  },
  parent,
}: GraphPointer): string => {
  return `${Math.random()}`;
  return JSON.stringify({
    id,
    stackId, pathId, stepId,
    parent: parent ? getPointerKey(parent) : null,
  });
};

export type GraphPointerKey = string;
