import type { Colorize, } from "./colorize.js";
import type { GraphPointersStore, } from "./graph-pointers-store.js";
import { RuleRef, } from "./rule-ref.js";
export { RuleRef, } from "./rule-ref.js";

export interface PrintOpts { pointers?: GraphPointersStore; colorize: Colorize; showPosition: boolean };

export enum RuleType {
  CHAR = 'CHAR',
  REF = 'REF',
  END = 'END',
  RANGE = 'RANGE',
}

export type Range = [number, number];

export interface RuleRange {
  type: RuleType.RANGE,
  value: Range[];
}
export interface RuleChar {
  type: RuleType.CHAR;
  value: number[];
}
export interface RuleEnd {
  type: RuleType.END;
}
export type GraphRule = RuleChar | RuleRef | RuleEnd | RuleRange;
// RuleRefs should never be exposed to the end user.
export type Rule = RuleChar | RuleRange | RuleEnd;

/** Type Guards */
export const isRuleType = (type?: unknown): type is RuleType => !!type && Object.values(RuleType).includes(type as RuleType);
export const isRule = (rule?: unknown): rule is GraphRule => !!rule && typeof rule === 'object' && 'type' in rule && isRuleType(rule.type);
export const isRuleRef = (rule?: GraphRule): rule is RuleRef => rule.type === RuleType.REF;
export const isRuleEnd = (rule?: GraphRule): rule is RuleEnd => rule.type === RuleType.END;
export const isRuleChar = (rule?: GraphRule): rule is RuleChar => rule.type === RuleType.CHAR;
export const isRuleRange = (rule?: GraphRule): rule is RuleRange => rule.type === RuleType.RANGE;
export const isRange = (range?: unknown): range is Range => Array.isArray(range) && range.length === 2 && range.every(n => typeof n === 'number');
