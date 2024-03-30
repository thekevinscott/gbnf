// import { CustomInspectFunction, InspectOptions } from "util";
import { GraphRootNode, } from "./graph-root-node.js";
import { GraphPointer, } from "./graph-pointer.js";
import { GraphNode, } from "./graph-node.js";
import { getSerializedRuleKey, } from "./get-serialized-rule-key.js";
import { colorize, } from "./colorize.js";
import { GraphPointersStore, } from "./graph-pointers-store.js";
import { GraphRule, Rule, isRuleChar, isRuleEnd, isRuleRange, isRuleRef, } from "./types.js";
import { isPointInRange, } from "../is-point-in-range.js";

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

export class Graph {
  roots = new Map<number, GraphRootNode>();

  pointers = new GraphPointersStore(this);

  constructor(stackedRules: GraphRule[][][], rootId: number) {
    for (let stackId = 0; stackId < stackedRules.length; stackId++) {
      const stack = stackedRules[stackId];
      this.roots.set(stackId, new GraphRootNode(this, stack, stackId));
    }

    const rootNode = this.roots.get(rootId);

    for (const { node, parent, } of this.fetchNodesForRootNode(this, rootNode)) {
      this.pointers.add(new GraphPointer(this, node, parent));
    }
  }

  getRootNode(stackId: number) {
    return this.roots.get(stackId);
  }

  setValid(pointers: GraphPointer[], valid: boolean) {
    for (const pointer of pointers) {
      pointer.valid = valid;
    }
  }

  parse(codePoint: number) {
    for (const { rule, pointers, } of this.iterateOverPointers()) {
      if (isRuleChar(rule)) {
        this.setValid(pointers, rule.value.reduce((
          isValid,
          possibleCodePoint,
        ) => isValid || codePoint === possibleCodePoint, false));
      } else if (isRuleRange(rule)) {
        this.setValid(pointers, isPointInRange(codePoint, rule.value));
      } else if (!isRuleEnd(rule)) {
        throw new Error(`Unsupported rule type: ${rule.type}`);
      }
    }
  }

  // generator that yields either the node, or if a reference rule, the referenced node
  * fetchNodesForRootNode(
    graph: Graph,
    rootNode: GraphRootNode,
    parent?: GraphPointer,
  ): IterableIterator<{ node: GraphNode; parent?: GraphPointer; }> {
    for (const node of rootNode.nodes.values()) {
      if (isRuleRef(node.rule)) {
        yield* this.fetchNodesForRootNode(graph, graph.getRootNode(node.rule.value), new GraphPointer(this, node, parent));
      } else {
        yield { node, parent, };
      }
    }
  }


  [customInspectSymbol](
    // depth: number, inspectOptions: InspectOptions, inspect: CustomInspectFunction
  ) {
    return this.print(true);
  }

  print = (colors = false) => {
    const roots = Array.from(this.roots.values());
    const graphView = roots.reduce<string[]>((acc, rootNode) => acc.concat(rootNode.print(this.pointers, {
      showPosition: true,
      colorize: colors ? colorize : str => `${str}`,
    })), []);
    return `\n${graphView.join('\n')}`;
  };

  get rules(): Rule[] {
    const seen = new Set<string>();
    const rules: Rule[] = [];

    for (const { rule, } of this.pointers) {
      if (isRuleRef(rule)) {
        throw new Error('Encountered a reference rule when building rules array, this should not happen');
      }
      const key = getSerializedRuleKey(rule);
      if (!seen.has(key)) {
        seen.add(key);
        rules.push(rule);
      }
    }
    return rules;
  }

  * iterateOverPointers(): IterableIterator<{ rule: GraphRule; pointers: GraphPointer[]; }> {
    const seenRules = new Map<string, { rule: GraphRule; pointers: GraphPointer[]; }>();
    const seen = new Set<GraphNode>();
    for (const pointer of this.pointers) {
      const rule = pointer.rule;
      const ruleKey = getSerializedRuleKey(rule);
      if (!seenRules.has(ruleKey)) {
        seenRules.set(ruleKey, { rule, pointers: [pointer,], });
        if (seen.has(pointer.node)) {
          throw new Error('encountered a node twice in the graph, this should not happen');
        }
        seen.add(pointer.node);
        if (isRuleRef(rule)) {
          throw new Error('Encountered a reference rule in the graph, this should not happen');
        }
      } else {
        seenRules.get(ruleKey).pointers.push(pointer);
      }
    }

    for (const { rule, pointers, } of seenRules.values()) {
      yield { rule, pointers, };
    }

    this.pointers.increment();
  }
}
