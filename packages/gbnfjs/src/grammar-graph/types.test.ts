import { describe, it, expect } from 'vitest';
import {
  isRule,
  isRuleType,
  isRuleRef,
  isRuleEnd,
  isRuleChar,
  isRuleCharExcluded,
  isRange,
  RuleType,
  RuleChar,
  RuleCharExclude,
  RuleEnd
} from './types.js';
import { RuleRef } from './rule-ref.js';

describe('Rule Type Guards', () => {
  describe('isRule', () => {
    it('should return true for valid rule objects', () => {
      const ruleChar: RuleChar = { type: RuleType.CHAR, value: [65, [66, 67]] };
      expect(isRule(ruleChar)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isRule({ type: 'invalid', value: [] })).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isRule(null)).toBe(false);
      expect(isRule(undefined)).toBe(false);
    });
  });

  describe('isRuleType', () => {
    it('should return true for valid rule types', () => {
      expect(isRuleType(RuleType.CHAR)).toBe(true);
      expect(isRuleType(RuleType.END)).toBe(true);
    });

    it('should return false for invalid rule types', () => {
      expect(isRuleType('not_a_rule_type')).toBe(false);
    });
  });

  describe('isRuleRef', () => {
    it('should recognize RuleRef instances', () => {
      const ruleRef = new RuleRef(1);
      expect(isRuleRef(ruleRef)).toBe(true);
    });

    it('should not misidentify other rule types', () => {
      const ruleChar: RuleChar = { type: RuleType.CHAR, value: [65] };
      expect(isRuleRef(ruleChar)).toBe(false);
    });
  });

  describe('isRuleEnd', () => {
    it('recognizes an end rule', () => {
      const ruleEnd: RuleEnd = { type: RuleType.END };
      expect(isRuleEnd(ruleEnd)).toBe(true);
    });

    it('does not confuse with other types', () => {
      const ruleChar: RuleChar = { type: RuleType.CHAR, value: [65] };
      expect(isRuleEnd(ruleChar)).toBe(false);
    });
  });

  describe('isRuleChar and isRuleCharExcluded', () => {
    it('identifies character rules', () => {
      const ruleChar: RuleChar = { type: RuleType.CHAR, value: [65] };
      expect(isRuleChar(ruleChar)).toBe(true);
      expect(isRuleCharExcluded(ruleChar)).toBe(false);
    });

    it('identifies character exclusion rules', () => {
      const ruleCharExclude: RuleCharExclude = { type: RuleType.CHAR_EXCLUDE, value: [65] };
      expect(isRuleCharExcluded(ruleCharExclude)).toBe(true);
      expect(isRuleChar(ruleCharExclude)).toBe(false);
    });
  });

  describe('isRange', () => {
    it('identifies valid ranges', () => {
      expect(isRange([1, 10])).toBe(true);
    });

    it('rejects invalid ranges', () => {
      expect(isRange([1, '10'])).toBe(false); // Mixed types
      expect(isRange([1])).toBe(false); // Not enough elements
      expect(isRange(5)).toBe(false); // Not an array
    });
  });
});
