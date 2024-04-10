import type { ValidInput, } from "./types.js";

export const getInputAsCodePoints = (src: ValidInput): number[] => {
  if (typeof src !== 'string') {
    return Array.isArray(src) ? src : [src,];
  }

  const codePoints: number[] = [];
  for (let i = 0; i < src.length; i++) {
    codePoints.push(src.codePointAt(i));
  }
  return codePoints;
};
