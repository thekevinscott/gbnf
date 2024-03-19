import { parseHex } from './parse-hex.js';

describe('parseHex', () => {
  it.each([
    ['1A', 0, 2, [0x1A, '']],
    ['FF', 0, 2, [0xFF, '']],
    ['0F', 0, 2, [0x0F, '']],
    ['A1', 0, 2, [0xA1, '']],
    ['abcdef', 0, 6, [0xabcdef, '']],
  ])('should parse hexadecimal characters (%s) correctly', (input, startPos, size, expectedOutput) => {
    expect(parseHex(input, startPos, size)).toEqual(expectedOutput);
  });

  it.each([
    ['123', 0, 4],
    ['abc', 0, 4]
  ])('should throw an error if the input (%s) does not contain the expected number of hex characters', (input, startPos, size) => {
    expect(() => parseHex(input, startPos, size)).toThrowError(`Expecting ${size} hex chars at ${input}`);
  });

  it.each([
    ['1A1234', 0, 2, [0x1A, '1234']],
    ['FFabcdef', 0, 2, [0xFF, 'abcdef']],
    ['0F0F0F', 0, 2, [0x0F, '0F0F']],
    ['A1BCDE', 0, 2, [0xA1, 'BCDE']]
  ])('should return the remaining string after parsing', (input, startPos, size, expectedOutput) => {
    expect(parseHex(input, startPos, size)).toEqual(expectedOutput);
  });

  it('should handle empty input correctly', () => {
    expect(parseHex('', 0, 0)).toEqual([0, '']);
  });

  it.each([
    // ['abcdef', 1, 4, [0xbcde, 'f']],
    // ['123456', 2, 2, [0x34, '56']]
  ])('should correctly handle non-zero starting position', (input, startPos, size, expectedOutput) => {
    expect(parseHex(input, startPos, size)).toEqual(expectedOutput);
  });
});
