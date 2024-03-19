import { parseName } from './parse-name.js';

describe.only('parseName', () => {
  it('should return correct position when encountering a valid name', () => {
    const src = 'validName';
    const pos = parseName(src, 0);
    expect(pos).toEqual(src.length);
  });

  it('should return correct position when encountering a valid name starting at a non-zero position', () => {
    const src = '123validName';
    const pos = parseName(src, 3);
    expect(pos).toEqual(src.length);
  });

  it('should throw an error when encountering an invalid name', () => {
    const src = '123';
    expect(() => {
      parseName(src, 0);
    }).toThrowError('Expecting name at 123');
  });
});
