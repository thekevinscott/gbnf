import type { ValidInput, } from "../grammar-graph/types.js";

export const GRAMMAR_PARSER_ERROR_HEADER_MESSAGE = (reason: string) => `Failed to parse grammar: ${reason}`;
export const INPUT_PARSER_ERROR_HEADER_MESSAGE = `Failed to parse input string:`;
export const MAXIMUM_NUMBER_OF_ERROR_LINES_TO_SHOW = 3;

export const buildErrorPosition = (src: string, pos: number): string[] => {
  if (src === "") {
    return ["No input provided",];
  }

  const grammarLines = src.split('\n');

  let lineIdx = 0;
  while (pos > grammarLines[lineIdx].length - 1) {
    pos -= grammarLines[lineIdx].length;
    lineIdx += 1;
  }

  const linesToShow: string[] = [];
  for (let i = Math.max(0, lineIdx - (MAXIMUM_NUMBER_OF_ERROR_LINES_TO_SHOW - 1)); i <= lineIdx; i++) {
    linesToShow.push(grammarLines[i]);
  }
  return [
    ...linesToShow,
    ' '.repeat(pos) + '^',
  ];
};

export class GrammarParseError extends Error {
  grammar: string;
  pos: number;
  reason: string;
  constructor(grammar: string, pos: number, reason: string) {
    super([
      GRAMMAR_PARSER_ERROR_HEADER_MESSAGE(reason),
      '',
      ...buildErrorPosition(grammar, pos),
    ].join('\n'));
    this.name = 'GrammarParseError';
    this.grammar = grammar;
    this.reason = reason;
    this.pos = pos;
  }
}

export class InputParseError extends Error {
  src: ValidInput;
  pos: number;
  constructor(src: ValidInput, pos: number) {
    super([
      `Failed to parse input string:`,
      '',
      ...buildErrorPosition(getInputAsString(src), pos),
    ].join('\n'));
    this.src = src;
    this.pos = pos;
    this.name = 'InputParseError';
  }
}

const getInputAsString = (src: ValidInput) => {
  if (typeof src === 'string') {
    return src;
  }
  const codePoints = Array.isArray(src) ? src : [src,];
  return codePoints.map(cp => String.fromCodePoint(cp)).join('');
};
