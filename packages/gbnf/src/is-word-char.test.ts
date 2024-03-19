import { isWordChar } from './is-word-char.js';

describe('isWordChar function', () => {
  it('should return true for lowercase letters', () => {
    expect(isWordChar('a')).toBe(true);
    expect(isWordChar('z')).toBe(true);
  });

  it('should return true for uppercase letters', () => {
    expect(isWordChar('A')).toBe(true);
    expect(isWordChar('Z')).toBe(true);
  });

  it('should return true for digits', () => {
    expect(isWordChar('0')).toBe(true);
    expect(isWordChar('9')).toBe(true);
  });

  it('should return true for hyphen', () => {
    expect(isWordChar('-')).toBe(true);
  });

  it('should return false for non-word characters', () => {
    expect(isWordChar('@')).toBe(false);
    expect(isWordChar('_')).toBe(false);
    expect(isWordChar('?')).toBe(false);
    expect(isWordChar(' ')).toBe(false);
  });
});
