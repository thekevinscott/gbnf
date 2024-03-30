import { col, } from "./grammar-parser/graph/color.js";

export enum RuleType {
  CHAR = 'CHAR',
  CHAR_RNG_UPPER = 'CHAR_RNG_UPPER',
  // CHAR_RNG = 'CHAR_RNG',
  RULE_REF = 'RULE_REF',
  ALT = 'ALT',
  END = 'END',

  CHAR_NOT = 'CHAR_NOT',
  CHAR_ALT = 'CHAR_ALT',

  // only used for external rules
  RANGE = 'RANGE',
}

export type Range = [number, number];

export interface RuleRange {
  type: RuleType.RANGE,
  value: Range[];
}
export interface RuleWithNumericValue {
  type: RuleType.RULE_REF | RuleType.CHAR_ALT | RuleType.CHAR_NOT | RuleType.CHAR_RNG_UPPER;
  value: number;
}
export interface RuleChar {
  type: RuleType.CHAR;
  value: number[];
}
export interface RuleAltChar {
  type: RuleType.CHAR_ALT;
  value: number;
}
export interface RuleRef {
  type: RuleType.RULE_REF;
  value: number;
}
export interface RuleEnd {
  type: RuleType.END;
}
export interface RuleWithoutValue {
  type: RuleType.ALT | RuleType.END;
}
export type RuleDef = RuleChar | RuleWithNumericValue | RuleWithoutValue | RuleRange;
export type RuleCharOrAltChar = RuleChar | RuleAltChar;

export type SymbolIds = Map<string, number>;
export type RuleStack = RuleDef[][];

export interface RulePosition {
  stackPos: number;
  pathPos: number;
  rulePos: number;
  previous?: RulePosition[];
  depth: number;
}

export type Col = typeof col;
export interface PrintOpts { col: Col; showPosition: boolean };

/** Type Guards */
export const isRuleDefWithNumericValue = (rule?: RuleDef): rule is RuleWithNumericValue => [RuleType.CHAR, RuleType.RULE_REF, RuleType.CHAR_ALT, RuleType.CHAR_NOT, RuleType.CHAR_RNG_UPPER,].includes(rule.type);
export const isRuleDefWithoutValue = (rule?: RuleDef): rule is RuleWithoutValue => [RuleType.ALT, RuleType.END,].includes(rule.type);
export const isRuleDefType = (type?: unknown): type is RuleType => !!type && Object.values(RuleType).includes(type as RuleType);
export const isRuleDef = (rule?: unknown): rule is RuleDef => !!rule && typeof rule === 'object' && 'type' in rule && isRuleDefType(rule.type);
export const isRuleDefAlt = (rule?: RuleDef): rule is RuleRef => rule.type === RuleType.ALT;
export const isRuleDefRef = (rule?: RuleDef): rule is RuleRef => rule.type === RuleType.RULE_REF;
export const isRuleDefEnd = (rule?: RuleDef): rule is RuleEnd => rule.type === RuleType.END;
export const isRuleDefChar = (rule?: RuleDef): rule is RuleChar => rule.type === RuleType.CHAR;
export const isRuleDefCharAlt = (rule?: RuleDef): rule is RuleAltChar => rule.type === RuleType.CHAR_ALT;
export const isRuleDefCharRngUpper = (rule?: RuleDef): rule is { type: RuleType.CHAR_RNG_UPPER, value: number } => rule.type === RuleType.CHAR_RNG_UPPER;
export const isRuleDefRange = (rule?: RuleDef): rule is RuleRange => rule.type === RuleType.RANGE;
export const isRange = (range?: unknown): range is Range => Array.isArray(range) && range.length === 2 && range.every(n => typeof n === 'number');
