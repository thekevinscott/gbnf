import { isWordChar, } from "./is-word-char.js";

export const parseName = (src: string, pos: number): string => {
  let name = '';
  while (pos < src.length && isWordChar(src[pos])) {
    name += src[pos];
    pos++;
  }
  if (!name) {
    throw new Error(`Expecting name at ${src}`);
  }
  return name;
};
