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

export interface RuleWithRangeValues {
  type: RuleType.RANGE,
  value: Range[];
}
export interface RuleWithNumericValue {
  type: RuleType.CHAR | RuleType.RULE_REF | RuleType.CHAR_ALT | RuleType.CHAR_NOT | RuleType.CHAR_RNG_UPPER;
  value: number;
}
interface RuleWithoutValue {
  type: RuleType.ALT | RuleType.END;
}
export type Rule = RuleWithNumericValue | RuleWithoutValue | RuleWithRangeValues;

export type SymbolIds = Map<string, number>;
export type RuleStack = Rule[][];


export const isRuleWithNumericValue = (rule?: Rule): rule is RuleWithNumericValue => [RuleType.CHAR, RuleType.RULE_REF, RuleType.CHAR_ALT, RuleType.CHAR_NOT, RuleType.CHAR_RNG_UPPER,].includes(rule.type);
export const isRuleType = (type?: unknown): type is RuleType => !!type && Object.values(RuleType).includes(type as RuleType);
export const isRule = (rule?: unknown): rule is Rule => !!rule && typeof rule === 'object' && 'type' in rule && isRuleType(rule.type);
export const isRuleChar = (rule?: Rule): rule is (
  { type: RuleType.CHAR, value: number }
) => [RuleType.CHAR,].includes(rule?.type);
export const isRuleCharAlt = (rule?: Rule): rule is (
  { type: RuleType.CHAR_ALT, value: number }
) => [RuleType.CHAR_ALT,].includes(rule?.type);
export const isRuleCharRngUpper = (rule?: Rule): rule is { type: RuleType.CHAR_RNG_UPPER, value: number } => rule.type === RuleType.CHAR_RNG_UPPER;
export const isRuleRange = (rule?: Rule): rule is { type: RuleType.RANGE, value: Range[] } => rule.type === RuleType.RANGE;

export type Pointer = { stackPos: number; pathPos: number; rulePos: number; };
export type RulePointer = (Pointer | RulePointer)[];
