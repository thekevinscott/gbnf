import { GBNF } from './gbnf.js';
import singleString from './__fixtures__/grammars/single-string/grammar.gbnf?raw';
import singleStringExpectation from './__fixtures__/grammars/single-string/expectation.json';
import twoLinesReferencing from './__fixtures__/grammars/two-lines-referencing-expression/grammar.gbnf?raw';
import twoLinesReferencingExpectation from './__fixtures__/grammars/two-lines-referencing-expression/expectation.json';
import simpleGrammar from './__fixtures__/grammars/simple-grammar/grammar.gbnf?raw'
import simpleGrammarExpectation from './__fixtures__/grammars/simple-grammar/expectation.json';
import longerGrammar from './__fixtures__/grammars/longer-grammar/grammar.gbnf?raw'
import longerGrammarExpectation from './__fixtures__/grammars/longer-grammar/expectation.json';

describe.only('Grammar Parser Tests', () => {
  it.each([
    [
      'single-string',
      singleString,
      singleStringExpectation,
    ],
    [
      'two-lines-referencing-expression',
      twoLinesReferencing,
      twoLinesReferencingExpectation,
    ],
    [
      'simple-grammar',
      simpleGrammar,
      simpleGrammarExpectation,
    ],
    [
      'longer-grammar',
      longerGrammar,
      longerGrammarExpectation,
    ],
  ])('parses grammar %s', (_key, grammar, { symbolIds, rules }) => {
    const parsedGrammar = GBNF(grammar);
    expect(Array.from(parsedGrammar.symbolIds.entries())).toEqual(symbolIds);
    expect(parsedGrammar.rules).toEqual(rules);
  });
});
