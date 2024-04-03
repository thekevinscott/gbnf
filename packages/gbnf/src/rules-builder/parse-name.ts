import { GrammarParseError, } from "../grammar-parser/errors.js";
import { isWordChar, } from "./is-word-char.js";

export const PARSE_NAME_ERROR = 'Failed to find a valid name';

const VALID_NAME_SEPARATORS = [
  '-',
  '_',
];

export const parseName = (grammar: string, pos: number): string => {
  let name = '';
  while (pos < grammar.length && (isWordChar(grammar[pos]) || VALID_NAME_SEPARATORS.includes(grammar[pos]))) {
    name += grammar[pos];
    pos++;
  }
  if (!name) {
    throw new GrammarParseError(grammar, pos, PARSE_NAME_ERROR);
  }
  return name;
};
