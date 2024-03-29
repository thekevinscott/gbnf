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
interface RuleWithoutValue {
  type: RuleType.ALT | RuleType.END;
}
export type Rule = RuleChar | RuleWithNumericValue | RuleWithoutValue | RuleRange;
export type RuleCharOrAltChar = RuleChar | RuleAltChar;

export type SymbolIds = Map<string, number>;
export type RuleStack = Rule[][];

export interface RulePosition {
  stackPos: number;
  pathPos: number;
  rulePos: number;
  previous?: RulePosition[];
  depth: number;
}

/** Type Guards */
export const isRuleWithNumericValue = (rule?: Rule): rule is RuleWithNumericValue => [RuleType.CHAR, RuleType.RULE_REF, RuleType.CHAR_ALT, RuleType.CHAR_NOT, RuleType.CHAR_RNG_UPPER,].includes(rule.type);
export const isRuleType = (type?: unknown): type is RuleType => !!type && Object.values(RuleType).includes(type as RuleType);
export const isRule = (rule?: unknown): rule is Rule => !!rule && typeof rule === 'object' && 'type' in rule && isRuleType(rule.type);
export const isRuleAlt = (rule?: Rule): rule is RuleRef => rule.type === RuleType.ALT;
export const isRuleRef = (rule?: Rule): rule is RuleRef => rule.type === RuleType.RULE_REF;
export const isRuleEnd = (rule?: Rule): rule is RuleEnd => rule.type === RuleType.END;
export const isRuleChar = (rule?: Rule): rule is RuleChar => rule.type === RuleType.CHAR;
export const isRuleCharAlt = (rule?: Rule): rule is RuleAltChar => rule.type === RuleType.CHAR_ALT;
export const isRuleCharRngUpper = (rule?: Rule): rule is { type: RuleType.CHAR_RNG_UPPER, value: number } => rule.type === RuleType.CHAR_RNG_UPPER;
export const isRuleRange = (rule?: Rule): rule is RuleRange => rule.type === RuleType.RANGE;
export const isRange = (range?: unknown): range is Range => Array.isArray(range) && range.length === 2 && range.every(n => typeof n === 'number');
