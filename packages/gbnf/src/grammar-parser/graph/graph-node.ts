import { isRuleChar, isRuleRange, isRuleRef, type Rule, } from "../../types.js";
import type { GraphPointer, } from "./graph-pointer.js";
import type { Graph, } from "./graph.js";

export class GraphNode {
  rule: Rule;
  _next = new Map<number, GraphNode>();
  _pointers = new Set<GraphPointer>();
  stackId: number;
  pathId: number;
  stepId: number;
  graph: Graph;
  constructor(graph: Graph, stack: Rule[][], stackId: number, pathId: number, stepId: number) {
    this.graph = graph;
    this.stackId = stackId;
    this.pathId = pathId;
    this.stepId = stepId;
    this.rule = stack[pathId][stepId];

    if (stack[pathId][stepId + 1]) {
      this._next.set(pathId, new GraphNode(graph, stack, stackId, pathId, stepId + 1));
    }
  }

  set pointer(pointer: GraphPointer) {
    if (this._pointers.has(pointer)) {
      throw new Error('This node already has a reference to this pointer');
    }
    this._pointers.add(pointer);
  }

  deletePointer(pointer: GraphPointer) {
    if (!this._pointers.has(pointer)) {
      throw new Error('This node does not have a reference to this pointer');
    }
    this._pointers.delete(pointer);
  }

  print = (pointers: Set<GraphPointer>, showPosition = false): string => {
    // [customInspectSymbol](depth: number, inspectOptions: InspectOptions, inspect: CustomInspectFunction) {
    const rule = this.rule;

    const parts: (string | number)[] = [];
    if (showPosition) {
      parts.push('{'.blue, `${[this.stepId,].join('-')}`.cyan + `}`.blue);
    }
    // const parts: (string | number)[] = showPosition ? [`${[this.pathId, this.stepId,].join('-')}`.underline + `|`.gray,] : [];
    if (isRuleChar(rule)) {
      parts.push('['.gray + rule.value.map(v => String.fromCharCode(v)).join('').yellow + ']'.gray);
    } else if (isRuleRange(rule)) {
      parts.push('['.gray + rule.value.map(range => range.map(v => String.fromCharCode(v).yellow).join('-').gray).join('') + ']'.gray);
    } else if (isRuleRef(rule)) {
      parts.push('REF('.gray + `${rule.value}`.green + ')'.gray);
    } else {
      parts.push(rule.type.yellow);
    }

    for (const pointer of pointers) {
      if (pointer.node === this) {
        parts.push('*'.red);
        if (!!pointer.parent) {
          parts.push('p'.red);
        }
      }
    }
    return [parts.join(''), ...Array.from(this._next.values()).map(node => node.print(pointers, showPosition)),].join('->'.gray);
  };

  * rules(): IterableIterator<Rule> {
    if (isRuleRef(this.rule)) {
      yield this.rule;
    } else {
      yield this.rule;
    }
  }

  * nextNodes(): IterableIterator<{ node: GraphNode; parent?: GraphNode; }> {
    for (const node of this._next.values()) {
      if (isRuleRef(node.rule)) {
        for (const nextNode of this.graph.getRootNode(node.rule.value).next) {
          yield { node: nextNode, parent: node, };
        }
      } else {
        yield { node, };
      }
    }

  }
}
