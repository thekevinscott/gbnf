import { describe, it, expect, } from 'vitest';
import { GrammarParseError } from '../utils/errors.js';
import { PARSE_NAME_ERROR, parseName } from './parse-name.js';

describe('parseName', () => {
  it('should return correct position when encountering a valid name', () => {
    const src = 'validName';
    const name = parseName(src, 0);
    expect(name).toEqual(src);
  });

  it('should return correct position when encountering a valid name starting at a non-zero position', () => {
    const src = '123validName';
    const name = parseName(src, 3);
    expect(name).toEqual('validName');
  });

  it('should throw an error when encountering an invalid name', () => {
    const src = '123';
    expect(() => {
      parseName(src, 0);
    }).toThrow(new GrammarParseError(src, 0, PARSE_NAME_ERROR));
  });
});
