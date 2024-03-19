import { isWordChar } from "./is-word-char.js";

export const parseName = (src: string, pos: number): number => {
  while (pos < src.length && isWordChar(src[pos])) {
    pos++;
  }
  console.log('pos', pos)
  if (pos === 0) {
    throw new Error(`Expecting name at ${src}`);
  }
  return pos;
}
