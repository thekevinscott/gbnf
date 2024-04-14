import { colorize, } from "./colorize.js";
import { GraphNode, } from "./graph-node.js";
import { printGraphPointer, } from "./print.js";
import { RuleRef, } from "./rule-ref.js";
import {
  UnresolvedRule,
  ResolvedRule,
  RuleChar,
  RuleCharExclude,
  RuleEnd,
  customInspectSymbol,
  isRuleChar,
  isRuleCharExcluded,
  isRuleEnd,
  isRuleRef,
} from "./types.js";

export type ResolvedGraphPointer = GraphPointer<ResolvedRule>;
export const isGraphPointerRuleRef = (pointer: GraphPointer): pointer is GraphPointer<RuleRef> => isRuleRef(pointer.rule);
export const isGraphPointerRuleEnd = (pointer: GraphPointer): pointer is GraphPointer<RuleEnd> => isRuleEnd(pointer.rule);
export const isGraphPointerRuleChar = (pointer: GraphPointer): pointer is GraphPointer<RuleChar> => isRuleChar(pointer.rule);
export const isGraphPointerRuleCharExclude = (pointer: GraphPointer): pointer is GraphPointer<RuleCharExclude> => isRuleCharExcluded(pointer.rule);

export class GraphPointer<R extends UnresolvedRule = UnresolvedRule> {
  node: GraphNode<R>;
  parent?: GraphPointer;
  #valid?: boolean;
  id: string;

  constructor(node: GraphNode<R>, parent?: GraphPointer) {
    if (node === undefined) {
      throw new Error('Node is undefined');
    }
    this.node = node;
    this.parent = parent;
    this.id = parent ? `${parent.id}-${node.id}` : node.id;
  }

  *resolve(resolved = false): IterableIterator<ResolvedGraphPointer> {
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
      throw new Error(`Unknown rule: ${JSON.stringify(this.node.rule)}`);
    }
  }

  *fetchNext(): IterableIterator<ResolvedGraphPointer> {
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

  print = printGraphPointer(this);

  [customInspectSymbol]() {
    return this.print({ colorize, });
  }
}


export type GraphPointerKey = string;
