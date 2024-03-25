import { parseChar } from "./parse-char";

describe('parseChar', () => {
  test.each([
    [
      'escaped 8-bit unicode char',
      'a',
      'a'.charCodeAt(0),
    ],
    [
      'escaped 8-bit unicode char',
      '9',
      '9'.charCodeAt(0),
    ],
  ])('parses char `%s`', (_key, char, codePoint) => {
    const grammar = `root ::= "${char}" "foo"`;
    expect(parseChar(grammar, `root ::= "`.length)).toEqual([codePoint, 1]);
  });

  test.each([
    [
      'escaped 8-bit unicode char',
      '\\x2A',
      '\x2A'.charCodeAt(0),
      5,
    ],
    [
      'escaped 16-bit unicode char',
      '\\u006F',
      '\u006F'.charCodeAt(0),
      7,
    ],
    [
      'escaped 32-bit unicode char',
      "\\U0001F4A9",
      128169,
      11,
    ],
    [
      'escaped tab char',
      "\\t",
      '\t'.charCodeAt(0),
      3,
    ],
    [
      'escaped new line char',
      "\\n",
      '\n'.charCodeAt(0),
      3,
    ],
    [
      'escaped \r char',
      "\\r",
      '\r'.charCodeAt(0),
      3,
    ],
    [
      'escaped quote char',
      "\\\"",
      '"'.charCodeAt(0),
      3,
    ],
    [
      'escaped [ char',
      "\\[",
      '['.charCodeAt(0),
      3,
    ],
    [
      'escaped ] char',
      "\\]",
      ']'.charCodeAt(0),
      3,
    ],
    [
      'escaped \ char',
      "\\\\",
      '\\'.charCodeAt(0),
      3,
    ],
  ])('parses escaped char `%s`', (key, escapedChar, codePoint, incPos) => {
    const grammar = `root ::= "\\${escapedChar}" "foo"`;
    expect(parseChar(grammar, `root ::= "`.length)).toEqual([codePoint, incPos]);
  });

  test('it throws on invalid input', () => {
    expect(() => parseChar('', 0)).toThrow();
    expect(() => parseChar('a', 1)).toThrow();
  });
});
