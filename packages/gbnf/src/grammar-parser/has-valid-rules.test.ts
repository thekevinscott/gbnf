import { RuleType } from '../types.js';
import { hasValidRules } from './has-valid-rules.js';

describe('hasValidRules', () => {
  test('it returns false for no valid rules', () => {
    expect(hasValidRules([])).toEqual(false);
  });

  test('it returns true for valid rules', () => {
    expect(hasValidRules([{
      type: RuleType.CHAR,
      value: 92,
    }])).toEqual(true);
  });

});
