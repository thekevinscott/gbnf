import { describe, test, expect, vi } from 'vitest';

import { GBNF } from './gbnf.js';
import { RulesBuilder, } from './rules-builder/index.js';
import * as _RulesBuilder from './rules-builder/index.js';
import { GrammarParseError } from './errors.js';
import { afterEach } from 'node:test';

// Mock the entire module
vi.mock('./rules-builder/index.js', async () => {
  const actual = await vi.importActual('./rules-builder/index.js') as typeof _RulesBuilder;
  class MockRulesBuilder {
    rules = [];
    symbolIds = new Map();
  }
  return {
    ...actual,
    RulesBuilder: MockRulesBuilder,
  };
});

describe('GBNF', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should throw if rules are empty', () => {
    expect(() => GBNF('')).toThrowError(new GrammarParseError('', 0, 'No rules were found'));
  });
});
