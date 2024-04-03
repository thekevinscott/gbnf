// import { CustomInspectFunction, InspectOptions } from "util";
import { GraphPointer, PublicGraphPointer, } from "./graph-pointer.js";
import { GraphNode, } from "./graph-node.js";
import { getSerializedRuleKey, } from "./get-serialized-rule-key.js";
import { colorize, } from "./colorize.js";
import { GenericSet, } from "./generic-set.js";
import { GraphRule, Pointers, Rule, isRange, isRuleChar, isRuleCharExcluded, isRuleEnd, isRuleRef, } from "./types.js";
import { isPointInRange, } from "../is-point-in-range.js";
import { InputParseError, } from "../errors.js";
import { RuleRef, } from "./rule-ref.js";
import { State, } from "./state.js";

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
type RootNode = Map<number, GraphNode>;
export class Graph {
  roots = new Map<number, RootNode>();
  rootId: number;
  rootNode: RootNode;
  pointers: Pointers;

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
    this.rootNode = this.roots.get(rootId);

    for (const ruleRef of ruleRefs) {
      const referencedNodes = new Set<GraphNode>();
      for (const node of this.roots.get(ruleRef.value).values()) {
        referencedNodes.add(node);
      }
      ruleRef.nodes = referencedNodes;
    }
  }

  getInitialPointers = (): Pointers => {
    const pointers: Pointers = new Set();

    for (const { node, parent, } of this.fetchNodesForRootNode(this.rootNode)) {
      const pointer = new GraphPointer(node, parent);
      for (const resolvedPointer of this.resolvePointer(pointer)) {
        pointers.add(resolvedPointer);
      }
    }
    return pointers;
  };

  setValid(pointers: GraphPointer[], valid: boolean) {
    for (const pointer of pointers) {
      pointer.valid = valid;
    }
  }

  parse(currentPointers: Pointers, codePoint: number): Pointers {
    for (const { rule, rulePointers, } of this.iterateOverPointers(currentPointers)) {
      if (isRuleChar(rule)) {
        const valid = rule.value.reduce((
          isValid,
          possibleCodePoint,
        ) => {
          if (isValid) {
            return true;
          }
          return isRange(possibleCodePoint) ? isPointInRange(codePoint, possibleCodePoint) : codePoint === possibleCodePoint;
        }, false);
        this.setValid(rulePointers, valid);
      } else if (isRuleCharExcluded(rule)) {
        const valid = rule.value.reduce((
          isValid,
          possibleCodePoint,
        ) => {
          if (!isValid) {
            return false;
          }
          return isRange(possibleCodePoint) ? !isPointInRange(codePoint, possibleCodePoint) : codePoint !== possibleCodePoint;
        }, true);
        this.setValid(rulePointers, valid);
      } else if (!isRuleEnd(rule)) {
        throw new Error(`Unsupported rule type: ${rule.type}`);
      }
    }

    const nextPointers: Pointers = new Set();
    for (const currentPointer of currentPointers) {
      for (const unresolvedNextPointer of currentPointer.fetchNext()) {
        for (const resolvedNextPointer of this.resolvePointer(unresolvedNextPointer)) {
          nextPointers.add(resolvedNextPointer);
        }
      }
    }
    return nextPointers;
  }

  * resolvePointer(unresolvedPointer: GraphPointer): IterableIterator<PublicGraphPointer> {
    for (const resolvedPointer of unresolvedPointer.resolve()) {
      if (isRuleRef(resolvedPointer.node.rule)) {
        throw new Error('Encountered a reference rule when building pointers to the graph');
      }
      if (isRuleEnd(resolvedPointer.node.rule) && !!resolvedPointer.parent) {
        throw new Error('Encountered an ending rule with a parent when building pointers to the graph');
      }
      yield resolvedPointer;
    }
  }

  public add = (_pointers: Pointers, src: string): Pointers => {
    let pointers = _pointers;
    for (let strPos = 0; strPos < src.length; strPos++) {
      pointers = this.parse(pointers, src.charCodeAt(strPos));
      if (pointers.size === 0) {
        throw new InputParseError(src, strPos);
      }
    }
    return pointers;
  };

  // generator that yields either the node, or if a reference rule, the referenced node
  // we need these function, as distinct from leveraging the logic in GraphPointer,
  // because that needs a rule ref with already defined nodes; this function is used to _set_ those nodes
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
    return this.print({ colors: true, });
  }

  print = ({ pointers, colors = false, }: { pointers?: Pointers; colors?: boolean } = {}) => {
    const nodes: GraphNode[][] = Array.from(this.roots.values()).map(nodes => Array.from(nodes.values()));
    const graphView = nodes.reduce<string[]>((acc, rootNode) => acc.concat(rootNode.map(node => node.print({
      pointers,
      showPosition: true,
      colorize: colors ? colorize : str => `${str}`,
    }))), []);
    return `\n${graphView.join('\n')}`;
  };

  * iterateOverPointers(pointers: Pointers): IterableIterator<{ rule: GraphRule; rulePointers: GraphPointer[]; }> {
    const seenRules = new Map<string, { rule: GraphRule; pointers: GraphPointer[]; }>();
    const seen = new GenericSet<GraphNode, string>(pointer => getSerializedRuleKey(pointer.rule));
    for (const pointer of pointers) {
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

    for (const { rule, pointers: rulePointers, } of seenRules.values()) {
      yield { rule, rulePointers: rulePointers, };
    }

  }
}
