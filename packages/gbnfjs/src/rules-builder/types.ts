export enum InternalRuleType {
  CHAR = 'CHAR',
  CHAR_RNG_UPPER = 'CHAR_RNG_UPPER',
  // CHAR_RNG = 'CHAR_RNG',
  RULE_REF = 'RULE_REF',
  ALT = 'ALT',
  END = 'END',

  CHAR_NOT = 'CHAR_NOT',
  CHAR_ALT = 'CHAR_ALT',
}

export interface InternalRuleDefWithNumericValue {
  type: InternalRuleType.RULE_REF | InternalRuleType.CHAR_ALT | InternalRuleType.CHAR_RNG_UPPER;
  value: number;
}
export interface InternalRuleDefChar {
  type: InternalRuleType.CHAR;
  value: number[];
}
export interface InternalRuleDefCharNot {
  type: InternalRuleType.CHAR_NOT;
  value: number[];
}
export interface InternalRuleDefAltChar {
  type: InternalRuleType.CHAR_ALT;
  value: number;
}
export interface InternalRuleDefReference {
  type: InternalRuleType.RULE_REF;
  value: number;
}
export interface InternalRuleDefEnd {
  type: InternalRuleType.END;
}
export interface InternalRuleDefWithoutValue {
  type: InternalRuleType.ALT | InternalRuleType.END;
}
export type InternalRuleDef = InternalRuleDefChar | InternalRuleDefCharNot | InternalRuleDefWithNumericValue | InternalRuleDefWithoutValue;
export type InternalRuleDefCharOrAltChar = InternalRuleDefChar | InternalRuleDefAltChar;

/** Type Guards */
export const isRuleDefType = (type?: unknown): type is InternalRuleType => !!type && Object.values(InternalRuleType).includes(type as InternalRuleType);
export const isRuleDef = (rule?: unknown): rule is InternalRuleDef => !!rule && typeof rule === 'object' && 'type' in rule && isRuleDefType(rule.type);
export const isRuleDefAlt = (rule?: InternalRuleDef): rule is InternalRuleDefReference => rule.type === InternalRuleType.ALT;
export const isRuleDefRef = (rule?: InternalRuleDef): rule is InternalRuleDefReference => rule.type === InternalRuleType.RULE_REF;
export const isRuleDefEnd = (rule?: InternalRuleDef): rule is InternalRuleDefEnd => rule.type === InternalRuleType.END;
export const isRuleDefChar = (rule?: InternalRuleDef): rule is InternalRuleDefChar => rule.type === InternalRuleType.CHAR;
export const isRuleDefCharNot = (rule?: InternalRuleDef): rule is InternalRuleDefCharNot => rule.type === InternalRuleType.CHAR_NOT;
export const isRuleDefCharAlt = (rule?: InternalRuleDef): rule is InternalRuleDefAltChar => rule.type === InternalRuleType.CHAR_ALT;
export const isRuleDefCharRngUpper = (rule?: InternalRuleDef): rule is { type: InternalRuleType.CHAR_RNG_UPPER, value: number } => rule.type === InternalRuleType.CHAR_RNG_UPPER;
