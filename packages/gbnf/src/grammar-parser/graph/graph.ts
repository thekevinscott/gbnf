// import { CustomInspectFunction, InspectOptions } from "util";
import { GraphPointer, } from "./graph-pointer.js";
import { GraphNode, } from "./graph-node.js";
import { getSerializedRuleKey, } from "./get-serialized-rule-key.js";
import { colorize, } from "./colorize.js";
import { GraphPointersStore, } from "./graph-pointers-store.js";
import { GraphRule, Rule, RuleRef, isRuleChar, isRuleEnd, isRuleRange, isRuleRef, } from "./types.js";
import { isPointInRange, } from "../is-point-in-range.js";

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

const getPointersSet = () => new GraphPointersStore();
export class Graph {
  roots = new Map<number, Map<number, GraphNode>>();

  pointers = getPointersSet();

  constructor(stackedRules: GraphRule[][][], rootId: number) {
    const ruleRefs: RuleRef[] = [];
    for (let stackId = 0; stackId < stackedRules.length; stackId++) {
      const stack = stackedRules[stackId];
      const nodes = new Map<number, GraphNode>();
      for (let pathId = 0; pathId < stack.length; pathId++) {
        const path = stack[pathId];
        let node: GraphNode;
        for (let stepId = path.length - 1; stepId >= 0; stepId--) {
          const next: GraphNode = node;
          const rule = stack[pathId][stepId];
          if (isRuleRef(rule)) {
            ruleRefs.push(rule);
          }
          node = new GraphNode(rule, { stackId, pathId, stepId, }, next);
        }
        nodes.set(pathId, node);
      }

      this.roots.set(stackId, nodes);
    }

    for (const ruleRef of ruleRefs) {
      const referencedNodes = new Set<GraphNode>();
      for (const { node, } of this.fetchNodesForRootNode(this, this.getRootNode(ruleRef.value))) {
        referencedNodes.add(node);
      }
      ruleRef.nodes = referencedNodes;
    }

    const rootNode = this.roots.get(rootId);

    for (const { node, parent, } of this.fetchNodesForRootNode(this, rootNode)) {
      const pointer = new GraphPointer(node, parent);
      this.pointers.add(pointer);
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

    const remainingPointers = this.pointers.pointers;
    this.pointers = getPointersSet();
    for (const pointer of remainingPointers) {
      for (const nextPointer of pointer.fetchNext()) {
        this.pointers.add(nextPointer);
      }
    }
  }

  // generator that yields either the node, or if a reference rule, the referenced node
  * fetchNodesForRootNode(
    graph: Graph,
    rootNodes: Map<number, GraphNode>,
    parent?: GraphPointer,
  ): IterableIterator<{ node: GraphNode; parent?: GraphPointer; }> {
    for (const node of rootNodes.values()) {
      if (isRuleRef(node.rule)) {
        yield* this.fetchNodesForRootNode(graph, graph.getRootNode(node.rule.value), new GraphPointer(node, parent));
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
    const nodes: GraphNode[][] = Array.from(this.roots.values()).map(nodes => Array.from(nodes.values()));
    const graphView = nodes.reduce<string[]>((acc, rootNode) => acc.concat(rootNode.map(node => node.print({
      pointers: this.pointers,
      showPosition: true,
      colorize: colors ? colorize : str => `${str}`,
    }))), []);
    return `\n${graphView.join('\n')}`;
  };

  get rules(): Rule[] {
    const seen = new Set<string>();
    const rules: Rule[] = [];

    for (const { rule, } of this.pointers.pointers) {
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
    for (const pointer of this.pointers.pointers) {
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

  }
}
