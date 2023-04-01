// import { CustomInspectFunction, InspectOptions } from "util";
import { GraphPointer, GraphPointerKey, VisibleGraphPointer, getPointerKey, } from "./graph-pointer.js";
import { GraphNode, } from "./graph-node.js";
import { getSerializedRuleKey, } from "./get-serialized-rule-key.js";
import { colorize, } from "./colorize.js";
import { GenericSet, } from "./generic-set.js";
import { GraphRule, Rule, RuleRef, isRange, isRuleChar, isRuleEnd, isRuleRef, } from "./types.js";
import { isPointInRange, } from "../is-point-in-range.js";

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

const getPointersSet = () => new GenericSet<VisibleGraphPointer, GraphPointerKey>(getPointerKey);
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
      for (const { node, } of this.fetchNodesForRootNode(this.roots.get(ruleRef.value))) {
        referencedNodes.add(node);
      }
      ruleRef.nodes = referencedNodes;
    }

    const rootNode = this.roots.get(rootId);

    for (const { node, parent, } of this.fetchNodesForRootNode(rootNode)) {
      const pointer = new GraphPointer(node, parent);
      this.addPointer(pointer);
    }
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
        ) => {
          if (isValid) {
            return true;
          }
          if (isRange(possibleCodePoint)) {
            return isPointInRange(codePoint, possibleCodePoint);
          }
          return codePoint === possibleCodePoint;
        }, false));
      } else if (!isRuleEnd(rule)) {
        throw new Error(`Unsupported rule type: ${rule.type}`);
      }
    }

    const remainingPointers = [...this.pointers,];
    this.pointers = getPointersSet();
    for (const pointer of remainingPointers) {
      for (const nextPointer of pointer.fetchNext()) {
        this.addPointer(nextPointer);
      }
    }
  }

  addPointer(unresolvedPointer: GraphPointer) {
    for (const pointer of unresolvedPointer.resolve()) {
      if (isRuleRef(pointer.node.rule)) {
        throw new Error('Encountered a reference rule when building pointers to the graph');
      }
      if (isRuleEnd(pointer.node.rule) && !!pointer.parent) {
        throw new Error('Encountered an ending rule with a parent when building pointers to the graph');
      }
      this.pointers.add(pointer);
    }
  }

  // generator that yields either the node, or if a reference rule, the referenced node
  * fetchNodesForRootNode(
    rootNodes: Map<number, GraphNode>,
    parent?: GraphPointer,
  ): IterableIterator<{ node: GraphNode; parent?: GraphPointer; }> {
    for (const node of rootNodes.values()) {
      if (isRuleRef(node.rule)) {
        yield* this.fetchNodesForRootNode(this.roots.get(node.rule.value), new GraphPointer(node, parent));
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

  rules<StopToken>(stopToken: StopToken = null): Rule[] {
    const rules = new GenericSet<Rule, string>(getSerializedRuleKey);

    for (const { rule, } of this.pointers) {
      rules.add(rule);
    }
    return Array.from(rules);
  }

  * iterateOverPointers(): IterableIterator<{ rule: GraphRule; pointers: GraphPointer[]; }> {
    const seenRules = new Map<string, { rule: GraphRule; pointers: GraphPointer[]; }>();
    const seen = new GenericSet<GraphNode, string>(pointer => getSerializedRuleKey(pointer.rule));
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

  }
}
