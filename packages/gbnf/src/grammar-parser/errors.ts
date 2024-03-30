export class InputParseError extends Error {
  src: string;
  strPos: number;
  constructor(src: string, strPos: number) {
    super([
      `Failed to parse input string:`,
      '',
      `${limit(src)}`,
      ' '.repeat(strPos) + '^',
      // '',
      // `Failed at position ${strPos}, character: ${src[strPos]}`,
      '',
    ].join('\n'));
    this.src = src;
    this.strPos = strPos;
    this.name = 'InputParseError';
  }
}

const limit = (str: string, limit: number = 30) => {
  return str.length > limit ? `${str.substring(0, limit - 3)}...` : str;
};
