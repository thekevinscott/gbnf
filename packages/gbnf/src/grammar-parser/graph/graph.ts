// import { CustomInspectFunction, InspectOptions } from "util";
import { RuleDef, isRuleDefRef as isRuleDefRef, } from "../../types.js";
import { buildRuleStack, } from "../build-rule-stack.js";
import { GraphRootNode, } from "./graph-root-node.js";
import { GraphPointer, } from "./graph-pointer.js";
import { GraphNode, } from "./graph-node.js";
import { getRuleKey, } from "./get-rule-key.js";
import { col, } from "./color.js";
import { RuleWrapper, } from "./rule.js";
import { Pointers, } from "./pointers.js";

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

export class Graph {
  roots = new Map<number, GraphRootNode>();

  pointers = new Pointers(this);

  constructor(ruleDefs: RuleDef[][], rootId: number) {
    const stackedRules: RuleDef[][][] = ruleDefs.map(buildRuleStack);
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

  getRootNode(stackId: number) {
    return this.roots.get(stackId);
  }

  // generator that yields either the node, or if a reference rule, the referenced node
  * fetchNodesForRootNode(
    graph: Graph,
    rootNode: GraphRootNode,
    parent?: GraphPointer,
  ): IterableIterator<{ node: GraphNode; parent?: GraphPointer; }> {
    for (const node of rootNode.nodes.values()) {
      if (isRuleDefRef(node.rule)) {
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
      col: colors ? col : str => `${str}`,
    })), []);
    return `\n${graphView.join('\n')}`;
  };

  get rules(): RuleDef[] {
    const seen = new Set<string>();
    const rules: RuleDef[] = [];

    for (const { rule, } of this.pointers) {
      const key = getRuleKey(rule);
      if (!seen.has(key)) {
        seen.add(key);
        rules.push(rule);
      }
    }
    return rules;
  }

  *[Symbol.iterator](): IterableIterator<RuleWrapper> {
    const seenRules = new Map<string, { rule: RuleDef; pointers: GraphPointer[]; }>();
    const seen = new Set<GraphNode>();
    for (const pointer of this.pointers) {
      const rule = pointer.rule;
      const ruleKey = getRuleKey(rule);
      if (!seenRules.has(ruleKey)) {
        seenRules.set(ruleKey, { rule, pointers: [pointer,], });
        if (seen.has(pointer.node)) {
          throw new Error('stop');
        }
        seen.add(pointer.node);
        if (isRuleDefRef(rule)) {
          throw new Error('Encountered a reference rule in the graph, this should not happen');
        }
      } else {
        seenRules.get(ruleKey).pointers.push(pointer);
      }
    }

    for (const { rule, pointers, } of seenRules.values()) {
      yield new RuleWrapper(rule, pointers);
    }

    this.pointers.increment();
  };
}
