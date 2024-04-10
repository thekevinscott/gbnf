import type { Colorize, } from "./colorize.js";
import type { GenericSet, } from "./generic-set.js";
import type { ResolvedGraphPointer, } from "./graph-pointer.js";
import type { RuleRef, } from "./rule-ref.js";

export const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
export type Pointers = GenericSet<ResolvedGraphPointer, string>;
export interface PrintOpts { pointers?: Pointers; colorize: Colorize; showPosition: boolean };

export enum RuleType {
  CHAR,
  CHAR_EXCLUDE,
  REF,
  END,
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
export type UnresolvedRule = RuleChar | RuleCharExclude | RuleRef | RuleEnd;
// RuleRefs should never be exposed to the end user.
export type ResolvedRule = RuleCharExclude | RuleChar | RuleEnd;
export type PublicRule = ResolvedRule;

/** Type Guards */
export const isGraphRule = (rule?: unknown): rule is UnresolvedRule => !!rule && typeof rule === 'object' && 'type' in rule && isRuleType(rule.type);
export const isRuleType = (type?: unknown): type is RuleType => !!type && Object.values(RuleType).includes(type as RuleType);
export const isRule = (rule?: unknown): rule is UnresolvedRule => !!rule && typeof rule === 'object' && 'type' in rule && isRuleType(rule.type);
export const isRuleRef = (rule?: UnresolvedRule): rule is RuleRef => rule.type === RuleType.REF;
export const isRuleEnd = (rule?: UnresolvedRule): rule is RuleEnd => rule.type === RuleType.END;
export const isRuleChar = (rule?: UnresolvedRule): rule is RuleChar => rule.type === RuleType.CHAR;
export const isRuleCharExcluded = (rule?: UnresolvedRule): rule is RuleCharExclude => rule.type === RuleType.CHAR_EXCLUDE;
export const isRange = (range?: unknown): range is Range => Array.isArray(range) && range.length === 2 && range.every(n => typeof n === 'number');

export type ValidInput = string | number | number[];
