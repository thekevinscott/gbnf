import type { ValidInput, } from "./graph/types.js";

export class GrammarParseError extends Error {
  constructor(grammar: string, pos: number, reason: string) {
    super([
      `Failed to parse grammar: ${reason}`,
      '',
      `${limit(grammar)}`,
      ' '.repeat(pos) + '^',
      '',
    ].join('\n'));
    this.name = 'GrammarParseError';
  }
}

export class InputParseError extends Error {
  src: ValidInput;
  strPos: number;
  constructor(src: ValidInput, strPos: number) {
    super([
      `Failed to parse input string:`,
      '',
      `${limit(getInputAsString(src))}`,
      ' '.repeat(strPos) + '^',
      '',
    ].join('\n'));
    this.src = src;
    this.strPos = strPos;
    this.name = 'InputParseError';
  }
}

const replaceEscapeSequences = (src: string) => {
  return src;
  // return src.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
};

const limit = (str: string, limit: number = 30 * 100) => {
  return str.length > limit ? `${replaceEscapeSequences(str).substring(0, limit - 3)}...` : replaceEscapeSequences(str);
};

const getInputAsString = (src: ValidInput) => {
  if (typeof src === 'string') {
    return src;
  }
  const codePoints = Array.isArray(src) ? src : [src,];
  return codePoints.map(cp => String.fromCodePoint(cp)).join('');
};
