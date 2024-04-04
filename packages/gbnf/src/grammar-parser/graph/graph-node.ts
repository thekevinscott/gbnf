import { Color, colorize, } from "./colorize.js";
import { RuleRef, } from "./rule-ref.js";
import { isRuleChar, isRuleRef, type PrintOpts, type UnresolvedRule, isRange, customInspectSymbol, } from "./types.js";

interface GraphNodeMeta {
  stackId: number;
  pathId: number;
  stepId: number;
}
export type GraphNodeRuleRef = GraphNode<RuleRef>;
export class GraphNode<R extends UnresolvedRule = UnresolvedRule> {
  rule: R;
  next?: GraphNode;
  meta: GraphNodeMeta;
  #id?: string;
  constructor(rule: R, meta: GraphNodeMeta, next?: GraphNode) {
    this.rule = rule;
    if (meta === undefined) {
      throw new Error('Meta is undefined');
    }
    this.meta = meta;
    this.next = next;
  }

  get id() {
    if (!this.#id) {
      this.#id = `${this.meta.stackId},${this.meta.pathId},${this.meta.stepId}`;
    }
    return this.#id;
  }

  [customInspectSymbol]() {
    return this.print({ colorize, showPosition: false, });
  }

  print = ({ pointers, showPosition = false, colorize: col, }: PrintOpts): string => {
    // [customInspectSymbol](depth: number, inspectOptions: InspectOptions, inspect: CustomInspectFunction) {
    const rule = this.rule;

    const parts: (string | number)[] = [];
    if (showPosition) {
      parts.push(
        col('{', Color.BLUE),
        col(this.id, Color.GRAY),
        col('}', Color.BLUE),
      );
    }
    if (isRuleChar(rule)) {
      parts.push(
        col('[', Color.GRAY),
        col(rule.value.map(v => {
          if (isRange(v)) {
            return v.map(val => col(String.fromCharCode(val), Color.YELLOW));
          }
          return getChar(v);
        }).join(''), Color.YELLOW),
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
