import { parseHex } from "./parse-hex.js";

export const parseChar = (src: string, pos: number): [number, string] | number => {
  if (src[0] === '\\') {
    switch (src[1]) {
      case 'x': return parseHex(src.slice(2), pos, 2);
      case 'u': return parseHex(src.slice(2), pos, 4);
      case 'U': return parseHex(src.slice(2), pos, 8);
      case 't': return 0x09;
      case 'r': return 0x0D;
      case 'n': return 0x0A;
      case '\\':
      case '"':
      case '[':
      case ']':
        return src.charCodeAt(1);
      default:
        throw new Error(`Unknown escape at ${src}`);
    }
  } else if (src[0]) {
    return decode_utf8(src)[0];
  }
  throw new Error("Unexpected end of input");
};

const decode_utf8 = (src: string): [number, string] => {
  const lookup: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4];
  const first_byte: number = src.charCodeAt(0);
  const highbits: number = first_byte >> 4;
  const len: number = lookup[highbits];
  const mask: number = (1 << (8 - len)) - 1;
  let value: number = first_byte & mask;
  let end: number = len; // may overrun!
  let pos: number = 1;
  for (; pos < end && src[pos]; pos++) {
    value = (value << 6) + (src.charCodeAt(pos) & 0x3F);
  }
  return [value, src.slice(pos)];
}
