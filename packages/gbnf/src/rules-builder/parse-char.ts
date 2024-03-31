import { GrammarParseError, } from "../grammar-parser/errors.js";

export const parseChar = (src: string, pos: number): [number, number] => {
  if (src.slice(pos, pos + 1) === '\\') {
    switch (src[pos + 2]) {
      case 'x': return [parseInt(src.slice(pos + 3, pos + 5), 16), 5,];
      case 'u': return [parseInt(src.slice(pos + 3, pos + 7), 16), 7,];
      case 'U': return [parseInt(src.slice(pos + 3, pos + 11), 16), 11,];
      case 't': return ['\t'.charCodeAt(0), 3,];
      case 'r': return ['\r'.charCodeAt(0), 3,];
      case 'n': return ['\n'.charCodeAt(0), 3,];

      case '"':
      case '[':
      case ']':
      case '\\':
        return [src.charCodeAt(pos + 2), 3,];
      default:
        throw new GrammarParseError(src, pos, `Unknown escape at ${src[pos]}`);
    }
  }

  if (!src[pos]) {
    throw new GrammarParseError(src, pos, "Unexpected end of grammar input, failed to complete parse");
  }
  return [src.charCodeAt(pos), 1,];
};
