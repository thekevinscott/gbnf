// import { CustomInspectFunction, InspectOptions } from "util";
import { GraphPointer, ResolvedGraphPointer, } from "./graph-pointer.js";
import { GraphNode, } from "./graph-node.js";
import { getSerializedRuleKey, } from "./get-serialized-rule-key.js";
import { colorize, } from "./colorize.js";
import { GenericSet, } from "./generic-set.js";
import { UnresolvedRule, Pointers, customInspectSymbol, isRange, isRuleChar, isRuleCharExcluded, isRuleEnd, isRuleRef, } from "./types.js";
import { isPointInRange, } from "../is-point-in-range.js";
import { InputParseError, } from "../errors.js";
import { RuleRef, } from "./rule-ref.js";

type RootNode = Map<number, GraphNode>;
const makePointers = () => new GenericSet<ResolvedGraphPointer, string>(p => p.id);
export class Graph {
  roots = new Map<number, RootNode>();
  rootId: number;
  rootNode: RootNode;
  pointers: Pointers;

  constructor(stackedRules: UnresolvedRule[][][], rootId: number) {
    const ruleRefs: RuleRef[] = [];
    const uniqueRules = new GenericSet<UnresolvedRule, string>(rule => getSerializedRuleKey(rule));
    for (let stackId = 0; stackId < stackedRules.length; stackId++) {
      const stack = stackedRules[stackId];
      const nodes = new Map<number, GraphNode>();
      for (let pathId = 0; pathId < stack.length; pathId++) {
        const path = stack[pathId];
        let node: GraphNode;
        for (let stepId = path.length - 1; stepId >= 0; stepId--) {
          const next: GraphNode = node;
          const rule = stack[pathId][stepId];
          uniqueRules.add(rule);
          if (isRuleRef(rule)) {
            ruleRefs.push(rule);
          }
          // rules coming in may be identical but have different references.
          // here, we ensure we always use the same reference for an identical rule.
          // this makes future comparisons easier.
          const uniqueRule = uniqueRules.get(rule);
          node = new GraphNode(uniqueRule, { stackId, pathId, stepId, }, next);
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
    const pointers = makePointers();

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

    // a pointer's id is the sum of its node's id and its parent's id chain.
    // if two pointers share the same id, it means they point to the same node and have identical parent chains.
    // for the purposes of walking the graph, we only need to keep one of them.
    const nextPointers = makePointers();
    for (const currentPointer of currentPointers) {
      for (const unresolvedNextPointer of currentPointer.fetchNext()) {
        for (const resolvedNextPointer of this.resolvePointer(unresolvedNextPointer)) {
          nextPointers.add(resolvedNextPointer);
        }
      }
    }
    return nextPointers;
  }

  * resolvePointer(unresolvedPointer: GraphPointer): IterableIterator<ResolvedGraphPointer> {
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

  public add = (src: string, _pointers?: Pointers,): Pointers => {
    let pointers = _pointers || this.getInitialPointers();
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

  * iterateOverPointers(pointers: Pointers): IterableIterator<{ rule: UnresolvedRule; rulePointers: GraphPointer[]; }> {
    const seenRules = new Map<UnresolvedRule, GraphPointer[]>();
    // const seen = new GenericSet<GraphNode, string>(pointer => getSerializedRuleKey(pointer.rule));
    for (const pointer of pointers) {
      const rule = pointer.rule;
      if (isRuleRef(rule)) {
        throw new Error('Encountered a reference rule in the graph, this should not happen');
      }
      if (!seenRules.has(rule)) {
        seenRules.set(rule, [pointer,],);
        // if (seen.has(pointer.node)) {
        //   throw new Error('encountered a node twice in the graph, this should not happen');
        // }
        // seen.add(pointer.node);
      } else {
        seenRules.get(rule).push(pointer);
      }
    }

    for (const [rule, rulePointers,] of seenRules.entries()) {
      yield { rule, rulePointers, };
    }
  }
}
