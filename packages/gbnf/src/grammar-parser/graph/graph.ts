// import { CustomInspectFunction, InspectOptions } from "util";
import { Rule, isRuleRef, } from "../../types.js";
import { buildRuleStack, } from "../build-rule-stack.js";
import 'colors';
import { GraphRootNode, } from "./graph-root-node.js";
import { GraphPointer, } from "./graph-pointer.js";
import { GraphNode, } from "./graph-node.js";

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

export class Graph {
  roots = new Map<number, GraphRootNode>();
  pointers = new Set<GraphPointer>();

  getRootNode(stackId: number) {
    return this.roots.get(stackId);
  }

  constructor(ruleDefs: Rule[][], rootId: number) {
    const stackedRules: Rule[][][] = ruleDefs.map(buildRuleStack);
    for (let stackId = 0; stackId < stackedRules.length; stackId++) {
      const stack = stackedRules[stackId];
      this.roots.set(stackId, new GraphRootNode(this, stack, stackId));
    }

    const rootNode = this.roots.get(rootId);

    // returns a list of nodes, _not_ root nodes
    for (const { node, parent, } of this.fetchNodesForRootNode(this, rootNode)) {
      this.pointers.add(new GraphPointer(this, node, parent));
    }
  }

  // generator that yields either the node, or if a reference rule, the referenced node
  * fetchNodesForRootNode(
    graph: Graph,
    rootNode: GraphRootNode,
    parent?: GraphNode
  ): IterableIterator<{ node: GraphNode; parent?: GraphNode; }> {
    for (const node of rootNode.nodes.values()) {
      if (isRuleRef(node.rule)) {
        yield* this.fetchNodesForRootNode(graph, graph.getRootNode(node.rule.value), node);
      } else {
        yield { node, parent, };
      }
    }
  }

  [customInspectSymbol](
    // depth: number, inspectOptions: InspectOptions, inspect: CustomInspectFunction
  ) {
    const roots = Array.from(this.roots.values());
    const graphView = roots.reduce<string[]>((acc, rootNode) => acc.concat(rootNode.print(this.pointers, true)), []);
    return `\n${graphView.join('\n')}`;
  }

  rules(): Rule[] {
    const rules: Rule[] = [];
    for (const pointer of this.pointers) {
      rules.push(pointer.rule);
    }
    return rules;
  }

  *[Symbol.iterator](): IterableIterator<{ pointer: GraphPointer; rule: Rule; }> {
    const pointers = Array.from(this.pointers);
    const seen = new Set<GraphNode>();
    for (const pointer of pointers) {
      if (!seen.has(pointer.node)) {
        seen.add(pointer.node);
        const rule = pointer.rule;
        yield { pointer, rule, };
      }
    }

    const remainingPointers = Array.from(this.pointers);
    for (const pointer of remainingPointers) {
      GraphPointer.delete(this.pointers, pointer);
      for (const { node: next, parent, } of pointer.nextNodes()) {
        this.pointers.add(new GraphPointer(this, next, parent));
      }
    }
  };
}

