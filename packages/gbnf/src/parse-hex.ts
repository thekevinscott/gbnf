export const parseHex = (src: string, pos: number, size: number): [number, string] => {
  const end: number = size;
  let value: number = 0;
  for (; pos < end && src[pos]; pos++) {
    value <<= 4;
    const char: string = src[pos];
    if ('a' <= char && char <= 'f') {
      value += char.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    } else if ('A' <= char && char <= 'F') {
      value += char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    } else if ('0' <= char && char <= '9') {
      value += char.charCodeAt(0) - '0'.charCodeAt(0);
    } else {
      break;
    }
  }
  if (pos !== end) {
    throw new Error(`Expecting ${size} hex chars at ${src}`);
  }
  return [value, src.slice(pos),];
};
