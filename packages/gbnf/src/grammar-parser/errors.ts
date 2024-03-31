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
  src: string;
  strPos: number;
  constructor(src: string, strPos: number) {
    super([
      `Failed to parse input string:`,
      '',
      `${limit(src)}`,
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
