import { Color, } from "./colorize.js";
import type { GraphPointer, } from "./graph-pointer.js";
import type { Graph, } from "./graph.js";
import { GraphPointersStore, } from "./graph-pointers-store.js";
import { isRuleChar, isRuleRange, isRuleRef, type PrintOpts, type GraphRule, } from "./types.js";

const rules = new Map<GraphRule, number>();
const getUniqueId = (rule: GraphRule) => {
  let id = rules.get(rule);
  if (id === undefined) {
    id = rules.size;
    rules.set(rule, id);
    return id;
  }
};
export class GraphNode {
  rule: GraphRule;
  _next = new Map<number, GraphNode>();
  _pointers = new Set<GraphPointer>();
  stackId: number;
  pathId: number;
  stepId: number;
  graph: Graph;
  constructor(graph: Graph, stack: GraphRule[][], stackId: number, pathId: number, stepId: number) {
    this.graph = graph;
    this.stackId = stackId;
    this.pathId = pathId;
    this.stepId = stepId;
    this.rule = stack[pathId][stepId];

    if (stack[pathId][stepId + 1]) {
      this._next.set(pathId, new GraphNode(graph, stack, stackId, pathId, stepId + 1));
    }
  }

  get id() {
    return getUniqueId(this.rule);
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

  print = (pointers: GraphPointersStore, { showPosition = false, colorize: col, }: PrintOpts): string => {
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
    if (isRuleChar(rule)) {
      parts.push(
        col('[', Color.GRAY),
        col(rule.value.map(v => getChar(v)).join(''), Color.YELLOW),
        col(']', Color.GRAY),
      );
    } else if (isRuleRange(rule)) {
      parts.push(
        col('[', Color.GRAY),
        ...rule.value.map(range => range.map(v => col(String.fromCharCode(v), Color.YELLOW)).join(col('-', Color.GRAY))),
        col(']', Color.GRAY),
      );
    } else if (isRuleRef(rule)) {
      parts.push(col('Ref(', Color.GRAY) + col(`${rule.value}`, Color.GREEN) + col(')', Color.GRAY));
    } else {
      parts.push(col(rule.type, Color.YELLOW));
    }

    for (const pointer of pointers) {
      const pointerParts: string[] = [];
      if (pointer.node === this) {
        pointerParts.push(
          pointer.print({ colorize: col, showPosition, }),
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
      ...Array.from(this._next.values()).map(node => node.print(pointers, { colorize: col, showPosition, })),
    ].join(col('-> ', Color.GRAY));
  };

  * rules(): IterableIterator<GraphRule> {
    yield this.rule;
  }

  * nextNodes(): IterableIterator<GraphNode> {
    for (const node of this._next.values()) {
      yield node;
    }

  }
  * nextNodesUnrollRuleDef(): IterableIterator<GraphNode> {
    for (const node of this._next.values()) {
      if (isRuleRef(node.rule)) {
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
