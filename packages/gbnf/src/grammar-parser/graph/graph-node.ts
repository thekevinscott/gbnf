import { Color, } from "./colorize.js";
import { isRuleChar, isRuleRange, isRuleRef, type PrintOpts, type GraphRule, RuleRef, } from "./types.js";

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
export type GraphNodeRuleRef = GraphNode<RuleRef>;
export class GraphNode<R extends GraphRule = GraphRule> {
  rule: R;
  next?: GraphNode;
  meta: GraphNodeMeta;
  constructor(rule: R, meta: GraphNodeMeta, next?: GraphNode) {
    this.rule = rule;
    if (meta === undefined) {
      throw new Error('Meta is undefined');
    }
    this.meta = meta;
    this.next = next;
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
        col(`${[this.meta.stackId, this.meta.pathId, this.meta.stepId,].join('-')}`, Color.GRAY),
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
      this.next?.print({ pointers, colorize: col, showPosition, }),
    ].filter(Boolean).join(col('-> ', Color.GRAY));
  };
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
