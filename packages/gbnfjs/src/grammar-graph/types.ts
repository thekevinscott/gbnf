import type { Colorize, } from "./colorize.js";
import type { GenericSet, } from "./generic-set.js";
import type { GraphPointer, } from "./graph-pointer.js";
import { RuleRef, } from "./rule-ref.js";

export const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
export type Pointers = GenericSet<ResolvedGraphPointer, string>;
export interface PrintOpts { pointers?: Pointers; colorize: Colorize; showPosition: boolean };

export enum RuleType {
  CHAR = 'char',
  CHAR_EXCLUDE = 'char_exclude',
  END = 'end',
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
export type ResolvedGraphPointer = GraphPointer<ResolvedRule>;

/** Type Guards */
export const isRuleType = (type?: unknown): type is RuleType => !!type && Object.values(RuleType).includes(type as RuleType);
export const isRule = (rule?: unknown): rule is UnresolvedRule => !!rule && typeof rule === 'object' && 'type' in rule && isRuleType(rule.type);
export const isRuleRef = (rule?: UnresolvedRule): rule is RuleRef => rule instanceof RuleRef;
export const isRuleEnd = (rule?: UnresolvedRule): rule is RuleEnd => !(isRuleRef(rule)) && rule.type === RuleType.END;
export const isRuleChar = (rule?: UnresolvedRule): rule is RuleChar => !(isRuleRef(rule)) && rule.type === RuleType.CHAR;
export const isRuleCharExcluded = (rule?: UnresolvedRule): rule is RuleCharExclude => !(isRuleRef(rule)) && rule.type === RuleType.CHAR_EXCLUDE;
export const isRange = (range?: unknown): range is Range => Array.isArray(range) && range.length === 2 && range.every(n => typeof n === 'number');

export type ValidInput = string | number | number[];

export const isGraphPointerRuleRef = (pointer: GraphPointer): pointer is GraphPointer<RuleRef> => isRuleRef(pointer.rule);
export const isGraphPointerRuleEnd = (pointer: GraphPointer): pointer is GraphPointer<RuleEnd> => isRuleEnd(pointer.rule);
export const isGraphPointerRuleChar = (pointer: GraphPointer): pointer is GraphPointer<RuleChar> => isRuleChar(pointer.rule);
export const isGraphPointerRuleCharExclude = (pointer: GraphPointer): pointer is GraphPointer<RuleCharExclude> => isRuleCharExcluded(pointer.rule);
