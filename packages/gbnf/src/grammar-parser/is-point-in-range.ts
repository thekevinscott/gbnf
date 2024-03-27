export const isPointInRange = (point: number, range: number[][]) => {
  let isValid = false;
  for (const [start, end,] of range) {
    if (point >= start && point <= end) {
      isValid = true;
      break;
    }
  }
  return isValid;
};

