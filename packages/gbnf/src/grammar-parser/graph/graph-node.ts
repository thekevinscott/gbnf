import { PrintOpts, isRuleDefChar, isRuleDefRange, isRuleDefRef as isRuleDefRef, type RuleDef, } from "../../types.js";
import { Color, } from "./color.js";
import type { GraphPointer, } from "./graph-pointer.js";
import type { Graph, } from "./graph.js";
import { Pointers, } from "./pointers.js";

export class GraphNode {
  id = Math.random();
  rule: RuleDef;
  _next = new Map<number, GraphNode>();
  _pointers = new Set<GraphPointer>();
  stackId: number;
  pathId: number;
  stepId: number;
  graph: Graph;
  constructor(graph: Graph, stack: RuleDef[][], stackId: number, pathId: number, stepId: number) {
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

  print = (pointers: Pointers, { showPosition = false, col, }: PrintOpts): string => {
    // [customInspectSymbol](depth: number, inspectOptions: InspectOptions, inspect: CustomInspectFunction) {
    const rule = this.rule;

    const parts: (string | number)[] = [];
    if (showPosition) {
      parts.push(
        col('{', Color.BLUE),
        col(`${[this.stepId,].join('-')}`, Color.GRAY),
        col('}', Color.BLUE),
      );
    }
    if (isRuleDefChar(rule)) {
      parts.push(
        col('[', Color.GRAY),
        col(rule.value.map(v => getChar(v)).join(''), Color.YELLOW),
        col(']', Color.GRAY),
      );
    } else if (isRuleDefRange(rule)) {
      parts.push(
        col('[', Color.GRAY),
        ...rule.value.map(range => range.map(v => col(String.fromCharCode(v), Color.YELLOW)).join(col('-', Color.GRAY))),
        col(']', Color.GRAY),
      );
    } else if (isRuleDefRef(rule)) {
      parts.push(col('Ref(', Color.GRAY) + col(`${rule.value}`, Color.GREEN) + col(')', Color.GRAY));
    } else {
      parts.push(col(rule.type, Color.YELLOW));
    }

    for (const pointer of pointers) {
      const pointerParts: string[] = [];
      if (pointer.node === this) {
        pointerParts.push(
          pointer.print({ col, showPosition, }),
        );
      }
      if (pointerParts.length) {
        parts.push(col('[', Color.GRAY));
        parts.push(...pointerParts);
        parts.push(col(']', Color.GRAY));
      }
    }
    return [
      parts.join(''),
      ...Array.from(this._next.values()).map(node => node.print(pointers, { col, showPosition, })),
    ].join(col('-> ', Color.GRAY));
  };

  * rules(): IterableIterator<RuleDef> {
    if (isRuleDefRef(this.rule)) {
      yield this.rule;
    } else {
      yield this.rule;
    }
  }

  * nextNodes(): IterableIterator<GraphNode> {
    for (const node of this._next.values()) {
      yield node;
    }

  }
  * nextNodesUnrollRuleDef(): IterableIterator<GraphNode> {
    for (const node of this._next.values()) {
      if (isRuleDefRef(node.rule)) {
        for (const nextNode of this.graph.getRootNode(node.rule.value).next) {
          yield nextNode;
        }
      } else {
        yield node;
      }
    }

  }
}

const getChar = (charCode: number) => {
  const char = String.fromCharCode(charCode);
  switch (char) {
    case '\n':
      return '\\n';
    default:
      return char;
  }
};
