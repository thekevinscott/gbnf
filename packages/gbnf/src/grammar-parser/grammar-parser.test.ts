import { GBNF } from '../gbnf.js';
import { RuleType } from '../types.js';

describe('GrammarParser', () => {
  describe("initialization", () => {
    test.each([
      // single char rule
      ['root ::= "foo"', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
      ]],
      // two char rules
      ['root ::= "foo" | "g" ', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'g'.charCodeAt(0), },
      ]],

      // three char rules
      ['root ::= "foo" | "bar" | "g" ', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'b'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'g'.charCodeAt(0), },
      ]],

      // three char rules with equivalent chars
      ['root ::= "foo" | "bar" | "baz" ', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'b'.charCodeAt(0), },
      ]],

      // expressions
      ['root ::= foo\\nfoo::="foo" ', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
      ]],
      // expression and a char rule
      ['root ::= foo|"bar"\\nfoo::="foo" ', [
        { type: RuleType.CHAR, value: 'b'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
      ]],
      // two expressions
      ['root ::= foo|bar\\nfoo::="foo"\\nbar::="bar" ', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'b'.charCodeAt(0), },
      ]],
      // nested expressions
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'b'.charCodeAt(0), },
      ]],

      // ranges
      ['root ::= [a-zA-Z]', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
      ]],
      // range with ? modifier
      ['root ::= [a-zA-Z]?', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
        { type: RuleType.END },
      ]],
      // range with + modifier
      ['root ::= [a-zA-Z]+', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
      ]],
      // range with * modifier
      ['root ::= [a-zA-Z]*', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
        { type: RuleType.END },
      ]],
    ])('it returns initial set of rules for grammar `%s`', (grammar, expectation) => {
      const Parser = GBNF(grammar.split('\\n').join('\n'));
      const parser = new Parser('');
      expect(parser.rules).toEqual(expectation);
    });
  });

  describe('initial string', () => {
    test.each([
      // single char rule
      ['root ::= "foo"', '1',],
      ['root ::= "foo"', 'b',],
      ['root ::= "foo"', 'f1',],
      ['root ::= "foo"', 'fo1',],
      ['root ::= "foo"', 'fooo',],
      ['root ::= "foo"', 'fooooooo',],

      // two char rules
      ['root ::= "foo" | "bar"', '1',],
      ['root ::= "foo" | "bar"', 'z',],
      ['root ::= "foo" | "bar"', 'f1',],
      ['root ::= "foo" | "bar"', 'b1',],
      ['root ::= "foo" | "bar"', 'fo1',],
      ['root ::= "foo" | "bar"', 'ba1',],
      ['root ::= "foo" | "bar"', 'fooo',],
      ['root ::= "foo" | "bar"', 'barrr',],

      // three char rules
      ['root ::= "foo" | "bar" | "baz"', '1',],
      ['root ::= "foo" | "bar" | "baz"', 'z',],
      ['root ::= "foo" | "bar" | "baz"', 'f1',],
      ['root ::= "foo" | "bar" | "baz"', 'b1',],
      ['root ::= "foo" | "bar" | "baz"', 'fo1',],
      ['root ::= "foo" | "bar" | "baz"', 'bal',],
      ['root ::= "foo" | "bar" | "baz"', 'fooo',],
      ['root ::= "foo" | "bar" | "baz"', 'bazrr',],

      // expressions
      ['root ::= foo\\nfoo ::="foo"', '1',],
      ['root ::= foo\\nfoo ::="foo"', 'b',],
      ['root ::= foo\\nfoo ::="foo"', 'f1',],
      ['root ::= foo\\nfoo ::="foo"', 'fo1',],
      ['root ::= foo\\nfoo ::="foo"', 'fooo',],

      // expression and a char rule
      ['root::=foo|"bar"\\nfoo::="foo"', '1',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'z',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'f1',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'b1',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'fo1',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'fooo',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'barr',],

      // two expressions
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', '1',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'z',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'f1',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'b1',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'fo1',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'fooo',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'barr',],

      // nested expressions
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', '1',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'z',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'f1',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'b1',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'fo1',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'fooo',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'barr',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'bazr',],

      // ranges
      ['root ::= [a-z]', 'A',],
      ['root ::= [a-z]', '0',],
      ['root ::= [a-z]', 'az',],

      // range with ? modifier
      [`root ::= [a-z]?`, 'A',],
      [`root ::= [a-z]?`, '0',],
      [`root ::= [a-z]?`, 'az',],

      // range with + modifier
      [`root ::= [a-z]+`, 'A',],
      [`root ::= [a-z]+`, '0',],
      [`root ::= [a-z]+`, 'az0',],

      // range with * modifier
      [`root ::= [a-z]*`, 'A',],
      [`root ::= [a-z]*`, '0',],
      [`root ::= [a-z]*`, 'az0',],
    ])('it throws if encountering a grammar `%s` with invalid input: `%s`', (grammar, input) => {
      const Parser = GBNF(grammar.split('\\n').join('\n'));
      expect(() => new Parser(input)).toThrow();
    });

    test.each([
      // single char rule
      ['root ::= "foo"', '', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
      ]],
      ['root ::= "foo"', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= "foo"', 'fo', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= "foo"', 'foo', [
        { type: RuleType.END },
      ]],

      // two char rules
      ['root ::= "foo" | "bar" ', '', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'b'.charCodeAt(0), },
      ]],
      ['root ::= "foo" | "bar" ', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= "foo" | "bar" ', 'fo', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= "foo" | "bar" ', 'foo', [
        { type: RuleType.END },
      ]],
      ['root ::= "foo" | "bar" ', 'b', [
        { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
      ]],
      ['root ::= "foo" | "bar" ', 'ba', [
        { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
      ]],
      ['root ::= "foo" | "bar" ', 'bar', [
        { type: RuleType.END },
      ]],

      // three char rules
      ['root ::= "foo" | "bar" | "baz"', 'ba', [
        { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'z'.charCodeAt(0), },
      ]],

      // expressions
      ['root ::= foo\\nfoo ::= "foo"', '', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
      ]],
      ['root ::= foo\\nfoo ::= "foo"', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo\\nfoo ::= "foo"', 'fo', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo\\nfoo ::= "foo"', 'foo', [
        { type: RuleType.END },
      ]],

      // expression and a char rule
      ['root ::= foo | "bar"\\nfoo ::= "foo"', '', [
        { type: RuleType.CHAR, value: 'b'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', 'fo', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', 'foo', [
        { type: RuleType.END },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', 'b', [
        { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', 'ba', [
        { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', 'bar', [
        { type: RuleType.END },
      ]],

      // two expressions
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', '', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'b'.charCodeAt(0), },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'fo', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'foo', [
        { type: RuleType.END },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'b', [
        { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'ba', [
        { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'bar', [
        { type: RuleType.END },
      ]],

      // nested expressions
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', '', [
        { type: RuleType.CHAR, value: 'f'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'b'.charCodeAt(0), },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'fo', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'foo', [
        { type: RuleType.END },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'b', [
        { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'ba', [
        { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'z'.charCodeAt(0), },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'bar', [
        { type: RuleType.END },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'baz', [
        { type: RuleType.END },
      ]],

      // ranges
      ['root ::= [a-z]', '', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
      ]],
      ['root ::= [a-zA-Z]', '', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
      ]],
      ['root ::= [a-z]', 'a', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-z]', 'm', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-z]', 'z', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-zA-Z]', 'a', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-zA-Z]', 'Z', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-zA-Z0-9]', 'Z', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-zA-Z0-9]', '0', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-zA-Z0-9]', '9', [
        { type: RuleType.END },
      ]],

      // range with ? modifier
      [`root ::= [a-z]?`, '', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [`root ::= [a-z]?`, 'a', [
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z]?`, 'Z', [
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z0-9]?`, '0', [
        { type: RuleType.END, },
      ]],

      // range with + modifier
      [`root ::= [a-z]+`, '', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
      ]],
      [`root ::= [a-z]+`, 'a', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z]+`, 'Z', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z]+`, 'azAZ', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],

      // range with * modifier
      [`root ::= [a-z]*`, '', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [`root ::= [a-z]*`, 'a', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z]+`, 'Z', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z]+`, 'abczABCZ', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],

      // real world bugs
      [
        'root ::= "foo" | "bar" | "baz" | "bazaar" | "barrington" ',
        'bazaa', [
          { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
        ]
      ],
    ])('it parses a grammar `%s` against input: `%s`', (grammar, input, expected) => {
      const Parser = GBNF(grammar.split('\\n').join('\n'));
      const parser = new Parser(input);
      expect(parser.rules).toEqual(expected);
    });
  });


  describe('additional strings', () => {
    test.each([
      // single char rule
      ['root ::= "foo"', 'f', '1',],
      ['root ::= "foo"', 'f', 'b',],
      ['root ::= "foo"', 'f', 'o1',],
      ['root ::= "foo"', 'f', 'ooo',],
      ['root ::= "foo"', 'f', 'ooooooo',],

      // two char rules
      ['root ::= "foo" | "bar"', 'f', '1',],
      ['root ::= "foo" | "bar"', 'b', '1',],
      ['root ::= "foo" | "bar"', 'f', 'o1',],
      ['root ::= "foo" | "bar"', 'b', 'a1',],
      ['root ::= "foo" | "bar"', 'f', 'ooo',],
      ['root ::= "foo" | "bar"', 'b', 'arrr',],

      // three char rules
      ['root ::= "foo" | "bar" | "baz"', 'f', '1',],
      ['root ::= "foo" | "bar" | "baz"', 'f', 'z',],
      ['root ::= "foo" | "bar" | "baz"', 'b', 'b1',],
      ['root ::= "foo" | "bar" | "baz"', 'f', 'o1',],
      ['root ::= "foo" | "bar" | "baz"', 'b', 'al',],
      ['root ::= "foo" | "bar" | "baz"', 'f', 'ooo',],
      ['root ::= "foo" | "bar" | "baz"', 'b', 'azrr',],

      // expressions
      ['root ::= foo\\nfoo ::="foo"', 'f', '1',],
      ['root ::= foo\\nfoo ::="foo"', 'f', 'b',],
      ['root ::= foo\\nfoo ::="foo"', 'f', 'o1',],
      ['root ::= foo\\nfoo ::="foo"', 'f', 'ooo',],

      // expression and a char rule
      ['root::=foo|"bar"\\nfoo::="foo"', 'f', '1',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'f', 'z',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'b', 'b1',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'f', 'o1',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'f', 'ooo',],
      ['root::=foo|"bar"\\nfoo::="foo"', 'b', 'arr',],

      // two expressions
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'f', '1',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'f', 'z',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'b', '1',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'f', 'o1',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'f', 'ooo',],
      ['root::= foo | bar\\n foo::="foo"\\n bar::="bar"', 'b', 'arr',],

      // nested expressions
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'f', '1',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'f', 'z',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'b', '1',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'f', 'o1',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'f', 'ooo',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'b', 'arr',],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'b', 'azr',],

      // ranges
      ['root ::= [a-z]', 'a', 'A',],
      ['root ::= [a-z]', 'a', '0',],
      ['root ::= [a-z]', 'a', 'az',],

      // range with ? modifier
      [`root ::= [a-z]?`, 'a', 'A',],
      [`root ::= [a-z]?`, 'a', '0',],
      [`root ::= [a-z]?`, 'a', 'az',],

      // range with + modifier
      [`root ::= [a-z]+`, 'a', 'A',],
      [`root ::= [a-z]+`, 'a', '0',],
      [`root ::= [a-z]+`, 'a', 'z0',],

      // range with * modifier
      [`root ::= [a-z]*`, 'a', 'A',],
      [`root ::= [a-z]*`, 'a', '0',],
      [`root ::= [a-z]*`, 'a', 'z0',],
    ])('it throws if encountering a grammar `%s` with starting `%s` and additional `%s`', (grammar, starting, additional) => {
      const Parser = GBNF(grammar.split('\\n').join('\n'));
      const parser = new Parser(starting);
      expect(() => parser.add(additional)).toThrow();
    });

    test.each([
      // single char rule
      ['root ::= "foo"', '', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= "foo"', 'f', 'o', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= "foo"', 'fo', 'o', [
        { type: RuleType.END },
      ]],

      // two char rules
      ['root ::= "foo" | "bar" ', '', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= "foo" | "bar" ', 'f', 'o', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= "foo" | "bar" ', 'fo', 'o', [
        { type: RuleType.END },
      ]],
      ['root ::= "foo" | "bar" ', '', 'b', [
        { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
      ]],
      ['root ::= "foo" | "bar" ', 'b', 'a', [
        { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
      ]],
      ['root ::= "foo" | "bar" ', 'ba', 'r', [
        { type: RuleType.END },
      ]],

      // three char rules
      ['root ::= "foo" | "bar" | "baz"', 'b', 'a', [
        { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'z'.charCodeAt(0), },
      ]],

      // expressions
      ['root ::= foo\\nfoo ::= "foo"', '', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo\\nfoo ::= "foo"', 'f', 'o', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo\\nfoo ::= "foo"', 'fo', 'o', [
        { type: RuleType.END },
      ]],

      // expression and a char rule
      ['root ::= foo | "bar"\\nfoo ::= "foo"', '', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', 'f', 'o', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', 'fo', 'o', [
        { type: RuleType.END },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', '', 'b', [
        { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', 'b', 'a', [
        { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
      ]],
      ['root ::= foo | "bar"\\nfoo ::= "foo"', 'ba', 'r', [
        { type: RuleType.END },
      ]],

      // two expressions
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', '', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'f', 'o', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'fo', 'o', [
        { type: RuleType.END },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', '', 'b', [
        { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'b', 'a', [
        { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
      ]],
      ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'ba', 'r', [
        { type: RuleType.END },
      ]],

      // nested expressions
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', '', 'f', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'f', 'o', [
        { type: RuleType.CHAR, value: 'o'.charCodeAt(0), },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'fo', 'o', [
        { type: RuleType.END },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', '', 'b', [
        { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'b', 'a', [
        { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
        { type: RuleType.CHAR, value: 'z'.charCodeAt(0), },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'ba', 'r', [
        { type: RuleType.END },
      ]],
      ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'ba', 'z', [
        { type: RuleType.END },
      ]],

      // ranges
      ['root ::= [a-z]', '', 'a', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-z]', '', 'm', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-z]', '', 'z', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-zA-Z]', '', 'a', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-zA-Z]', '', 'Z', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-zA-Z0-9]', '', 'Z', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-zA-Z0-9]', '', '0', [
        { type: RuleType.END },
      ]],
      ['root ::= [a-zA-Z0-9]', '', '9', [
        { type: RuleType.END },
      ]],

      // range with ? modifier
      [`root ::= [a-z]?`, '', 'a', [
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z]?`, '', 'Z', [
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z0-9]?`, '', '0', [
        { type: RuleType.END, },
      ]],

      // range with + modifier
      [`root ::= [a-z]+`, '', 'a', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z]+`, '', 'Z', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z]+`, 'azA', 'Z', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],

      // range with * modifier
      [`root ::= [a-z]*`, '', 'a', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z]+`, '', 'Z', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [`root ::= [a-zA-Z]+`, 'acczABC', 'Z', [
        { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
        { type: RuleType.END, },
      ]],
      [
        'root ::= "foo" | "bar" | "baz" | "bazaar" | "barrington" ',
        'baza', 'a', [
          { type: RuleType.CHAR, value: 'r'.charCodeAt(0), },
        ]
      ],
    ])('it parses a grammar `%s` with starting `%s` and additional `%s`', (grammar, starting, additional, expected) => {
      const Parser = GBNF(grammar.split('\\n').join('\n'));
      const parser = new Parser(starting);
      parser.add(additional);
      expect(parser.rules).toEqual(expected);
    });
  });
});
