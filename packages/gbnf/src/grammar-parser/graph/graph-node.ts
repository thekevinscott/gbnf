import { Color, } from "./colorize.js";
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

interface GraphNodeMeta {
  stackId: number;
  pathId: number;
  stepId: number;
}
export class GraphNode {
  rule: GraphRule;
  _next = new Map<number, GraphNode>();
  meta: GraphNodeMeta;
  constructor(stack: GraphRule[][], meta: GraphNodeMeta) {
    this.meta = meta;
    this.rule = stack[meta.pathId][meta.stepId];

    if (stack[meta.pathId][meta.stepId + 1]) {
      this._next.set(meta.pathId, new GraphNode(stack, { ...meta, stepId: meta.stepId + 1, }));
    }
  }

  get id() {
    return getUniqueId(this.rule);
  }

  print = ({ pointers, showPosition = false, colorize: col, }: PrintOpts): string => {
    // [customInspectSymbol](depth: number, inspectOptions: InspectOptions, inspect: CustomInspectFunction) {
    const rule = this.rule;

    const parts: (string | number)[] = [];
    if (showPosition) {
      parts.push(
        col('{', Color.BLUE),
        col(`${[this.meta.stepId,].join('-')}`, Color.GRAY),
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

    if (pointers) {
      for (const pointer of pointers) {
        const pointerParts: string[] = [];
        if (pointer.node === this) {
          pointerParts.push(
            pointer.print({ colorize: col, }),
          );
        }
        if (pointerParts.length) {
          parts.push(col('[', Color.GRAY));
          parts.push(...pointerParts);
          parts.push(col(']', Color.GRAY));
        }
      }
    }
    return [
      parts.join(''),
      ...Array.from(this._next.values()).map(node => node.print({ pointers, colorize: col, showPosition, })),
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
