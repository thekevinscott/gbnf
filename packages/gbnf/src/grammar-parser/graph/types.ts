import type { Colorize, } from "./colorize.js";
import type { VisibleGraphPointer, } from "./graph-pointer.js";
import type { RuleRef, } from "./rule-ref.js";

export interface PrintOpts { pointers?: Set<VisibleGraphPointer>; colorize: Colorize; showPosition: boolean };

export enum RuleType {
  CHAR = 'CHAR',
  CHAR_EXCLUDE = 'CHAR_EXCLUDE',
  REF = 'REF',
  END = 'END',
}

export type Range = [number, number];

export interface RuleChar {
  type: RuleType.CHAR;
  value: (number | Range)[];
}

export interface RuleCharExclude {
  type: RuleType.CHAR_EXCLUDE;
  value: (number | Range)[];
}
export interface RuleEnd {
  type: RuleType.END;
}
export type GraphRule = RuleChar | RuleCharExclude | RuleRef | RuleEnd;
// RuleRefs should never be exposed to the end user.
export type Rule = RuleCharExclude | RuleChar | RuleEnd;
export type ReturnRuleValue = Rule;

/** Type Guards */
export const isGraphRule = (rule?: unknown): rule is GraphRule => !!rule && typeof rule === 'object' && 'type' in rule && isRuleType(rule.type);
export const isRuleType = (type?: unknown): type is RuleType => !!type && Object.values(RuleType).includes(type as RuleType);
export const isRule = (rule?: unknown): rule is GraphRule => !!rule && typeof rule === 'object' && 'type' in rule && isRuleType(rule.type);
export const isRuleRef = (rule?: GraphRule): rule is RuleRef => rule.type === RuleType.REF;
export const isRuleEnd = (rule?: GraphRule): rule is RuleEnd => rule.type === RuleType.END;
export const isRuleChar = (rule?: GraphRule): rule is RuleChar => rule.type === RuleType.CHAR;
export const isRuleCharExcluded = (rule?: GraphRule): rule is RuleCharExclude => rule.type === RuleType.CHAR_EXCLUDE;
export const isRange = (range?: unknown): range is Range => Array.isArray(range) && range.length === 2 && range.every(n => typeof n === 'number');
