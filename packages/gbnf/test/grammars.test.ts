import GBNF, { RuleType, } from '../src/index.js';
const grammars: Record<string, {
  grammar: string;
  testCases: string[];
}> = import.meta.glob('./grammars/*.ts', {
  eager: true,
});

const escape = (str: string) => str.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
const unescape = (str: string) => str.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

describe('Grammars', () => {
  test.each([
    ...Object.entries(grammars).filter(([_, p]) => p.testCases).reduce<[string, string, string][]>((acc, [key, { grammar, testCases }]) => {
      return acc.concat(testCases.map(testCase => ([key, escape(testCase), escape(grammar)])));
    }, []),
  ])(`%s %s`, (_, _testCase, grammar,) => {
    const testCase = unescape(_testCase);
    const Parser = GBNF(unescape(grammar));
    const parser = new Parser('');
    for (let i = 0; i < testCase.length; i++) {
      parser.add(testCase[i]);
    }
  });
});
