import GBNF, { RuleType, } from '../src/index.js';

describe('creation with initial string', () => {
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
  ])('it throws if encountering a grammar `%s` with invalid input: `%s`', (grammar, input) => { expect(() => new (GBNF(grammar.split('\\n').join('\n')))(input)).toThrow(); });

  test.each([
    // single char rule
    ['root ::= "foo"', '', [
      { type: RuleType.CHAR, value: ['f'.charCodeAt(0)], },
    ]],
    ['root ::= "foo"', 'f', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= "foo"', 'fo', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= "foo"', 'foo', [
      { type: RuleType.END },
    ]],

    // two char rules
    ['root ::= "foo" | "bar" ', '', [
      { type: RuleType.CHAR, value: ['f'.charCodeAt(0)], },
      { type: RuleType.CHAR, value: ['b'.charCodeAt(0)], },
    ]],
    ['root ::= "foo" | "bar" ', 'f', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= "foo" | "bar" ', 'fo', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= "foo" | "bar" ', 'foo', [
      { type: RuleType.END },
    ]],
    ['root ::= "foo" | "bar" ', 'b', [
      { type: RuleType.CHAR, value: ['a'.charCodeAt(0)], },
    ]],
    ['root ::= "foo" | "bar" ', 'ba', [
      { type: RuleType.CHAR, value: ['r'.charCodeAt(0)], },
    ]],
    ['root ::= "foo" | "bar" ', 'bar', [
      { type: RuleType.END },
    ]],

    // three char rules
    ['root ::= "foo" | "bar" | "baz"', 'ba', [
      { type: RuleType.CHAR, value: ['r'.charCodeAt(0)], },
      { type: RuleType.CHAR, value: ['z'.charCodeAt(0)], },
    ]],

    // expressions
    ['root ::= foo\\nfoo ::= "foo"', '', [
      { type: RuleType.CHAR, value: ['f'.charCodeAt(0)], },
    ]],
    ['root ::= foo\\nfoo ::= "foo"', 'f', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= foo\\nfoo ::= "foo"', 'fo', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= foo\\nfoo ::= "foo"', 'foo', [
      { type: RuleType.END },
    ]],
    ['root ::= f\\nf ::= foo\\nfoo ::= "foo"', '', [
      { type: RuleType.CHAR, value: ['f'.charCodeAt(0)], },
    ]],

    // expression and a char rule
    ['root ::= foo | "bar"\\nfoo ::= "foo"', '', [
      { type: RuleType.CHAR, value: ['f'.charCodeAt(0)], },
      { type: RuleType.CHAR, value: ['b'.charCodeAt(0)], },
    ]],
    ['root ::= foo | "bar"\\nfoo ::= "foo"', 'f', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= foo | "bar"\\nfoo ::= "foo"', 'fo', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= foo | "bar"\\nfoo ::= "foo"', 'foo', [
      { type: RuleType.END },
    ]],
    ['root ::= foo | "bar"\\nfoo ::= "foo"', 'b', [
      { type: RuleType.CHAR, value: ['a'.charCodeAt(0)], },
    ]],
    ['root ::= foo | "bar"\\nfoo ::= "foo"', 'ba', [
      { type: RuleType.CHAR, value: ['r'.charCodeAt(0)], },
    ]],
    ['root ::= foo | "bar"\\nfoo ::= "foo"', 'bar', [
      { type: RuleType.END },
    ]],

    // two expressions
    ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', '', [
      { type: RuleType.CHAR, value: ['f'.charCodeAt(0)], },
      { type: RuleType.CHAR, value: ['b'.charCodeAt(0)], },
    ]],
    ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'f', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'fo', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'foo', [
      { type: RuleType.END },
    ]],
    ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'b', [
      { type: RuleType.CHAR, value: ['a'.charCodeAt(0)], },
    ]],
    ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'ba', [
      { type: RuleType.CHAR, value: ['r'.charCodeAt(0)], },
    ]],
    ['root ::= foo | bar\\nfoo ::= "foo"\\nbar ::= "bar"', 'bar', [
      { type: RuleType.END },
    ]],

    // nested expressions
    ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', '', [
      { type: RuleType.CHAR, value: ['f'.charCodeAt(0)], },
      { type: RuleType.CHAR, value: ['b'.charCodeAt(0)], },
    ]],
    ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'f', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'fo', [
      { type: RuleType.CHAR, value: ['o'.charCodeAt(0)], },
    ]],
    ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'foo', [
      { type: RuleType.END },
    ]],
    ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'b', [
      { type: RuleType.CHAR, value: ['a'.charCodeAt(0)], },
    ]],
    ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'ba', [
      { type: RuleType.CHAR, value: ['r'.charCodeAt(0)], },
      { type: RuleType.CHAR, value: ['z'.charCodeAt(0)], },
    ]],
    ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'bar', [
      { type: RuleType.END },
    ]],
    ['root ::= f | b\\nf ::= fo\\nb ::= ba\\nfo ::= foo\\nba ::= bar | baz\\nfoo ::= "foo"\\nbar ::= "bar"\\nbaz ::= "baz"', 'baz', [
      { type: RuleType.END },
    ]],

    // ranges
    ['root ::= [a-z]', '', [
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
    ]],
    ['root ::= [a-zA-Z]', '', [
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
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
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
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
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
    ]],
    [`root ::= [a-z]+`, 'l', [
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
      { type: RuleType.END, },
    ]],
    [`root ::= [a-zA-Z]+`, 'Z', [
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
      { type: RuleType.END, },
    ]],
    [`root ::= [a-zA-Z]+`, 'aZ', [
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
      { type: RuleType.END, },
    ]],
    [`root ::= [a-zA-Z]+`, 'azAZ', [
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
      { type: RuleType.END, },
    ]],

    // range with * modifier
    [`root ::= [a-z]*`, '', [
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
      { type: RuleType.END, },
    ]],
    [`root ::= [a-z]*`, 'a', [
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)]], },
      { type: RuleType.END, },
    ]],
    [`root ::= [a-zA-Z]+`, 'Z', [
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
      { type: RuleType.END, },
    ]],
    [`root ::= [a-zA-Z]+`, 'abczABCZ', [
      { type: RuleType.CHAR, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0)], ['A'.charCodeAt(0), 'Z'.charCodeAt(0)]], },
      { type: RuleType.END, },
    ]],

    // real world bugs
    // "baz" and "bazaar" are ambiguous, and a string "bazaa" should not result in an 'a' CHAR rule
    [
      'root ::= "foo" | "bar" | "baz" | "bazaar" | "barrington" ',
      'bazaa', [
        { type: RuleType.CHAR, value: ['r'.charCodeAt(0)], },
      ]
    ],
    // should be able to step _into_ a rule, and then continue with the previous rule
    [
      'root ::= ("bar" | "foo") "zyx"',
      'bar', [
        { type: RuleType.CHAR, value: ['z'.charCodeAt(0)], },
      ]
    ],
    // should be able to process a rule, then step _into_ a rule, with a pointer to previous rule
    [
      'root ::= "z" ("bar" | "foo") "zzzz"',
      'z', [
        { type: RuleType.CHAR, value: ['b'.charCodeAt(0)], },
        { type: RuleType.CHAR, value: ['f'.charCodeAt(0)], },
      ]
    ],
    // should be able to process a rule, then step _into_ a rule, and then continue with the previous rule
    [
      'root ::= "z" ("bar" | "foo") "zzz"',
      'zbar', [
        { type: RuleType.CHAR, value: ['z'.charCodeAt(0)], },
      ]
    ],
    [
      `root  ::= termz ([-+*/] termz)* \\n termz  ::= [0-9]+`,
      '1', [
        { type: RuleType.CHAR, value: [['0'.charCodeAt(0), '9'.charCodeAt(0)]], },
        {
          type: RuleType.CHAR, value: [
            '-'.charCodeAt(0),
            '+'.charCodeAt(0),
            '*'.charCodeAt(0),
            '/'.charCodeAt(0),
          ],
        },
        { type: RuleType.END, },
      ]
    ],
    [
      `root  ::= expr "=" termy  \\nexpr  ::= termy ([-+*/] termy)*\\n termy  ::= [0-9]+`,
      '1', [
        { type: RuleType.CHAR, value: [['0'.charCodeAt(0), '9'.charCodeAt(0)]], },
        {
          type: RuleType.CHAR, value: [
            '-'.charCodeAt(0),
            '+'.charCodeAt(0),
            '*'.charCodeAt(0),
            '/'.charCodeAt(0),
          ],
        },
        {
          type: RuleType.CHAR, value: ['='.charCodeAt(0),],
        },
      ]
    ],
    [
      `root  ::= (expr "=" terma "\\n")+\\nexpr  ::= terma ([-+*/] terma)*\\nterma  ::= [0-9]+`,
      '1', [
        { type: RuleType.CHAR, value: [['0'.charCodeAt(0), '9'.charCodeAt(0)]], },
        {
          type: RuleType.CHAR, value: [
            '-'.charCodeAt(0),
            '+'.charCodeAt(0),
            '*'.charCodeAt(0),
            '/'.charCodeAt(0),
          ],
        },
        {
          type: RuleType.CHAR, value: ['='.charCodeAt(0),],
        },
      ]
    ],
    [
      `root  ::= (expr "=" termb "\\n")+\\nexpr  ::= termb ([-+*/] termb)*\\ntermb  ::= [0-9]+`,
      '1+',
      [
        { type: RuleType.CHAR, value: [['0'.charCodeAt(0), '9'.charCodeAt(0)]], },
      ],
    ],
    [
      `root  ::= (expr "=" termc "\\n")+\\nexpr  ::= termc ([-+*/] termc)*\\ntermc  ::= [0-9]+`,
      '1=', [
        { type: RuleType.CHAR, value: [['0'.charCodeAt(0), '9'.charCodeAt(0)]], },
      ],
    ],
    [
      `root  ::= (expr "=" termd "\\n")+\\nexpr  ::= termd ([-+*/] termd)*\\ntermd  ::= [0-9]+`,
      '1+1', [
        { type: RuleType.CHAR, value: [['0'.charCodeAt(0), '9'.charCodeAt(0)]], },
        { type: RuleType.CHAR, value: ['-'.charCodeAt(0), '+'.charCodeAt(0), '*'.charCodeAt(0), '/'.charCodeAt(0)], },
        { type: RuleType.CHAR, value: ['='.charCodeAt(0)], },
      ]
    ],
    [
      `root  ::= (expr "=" term "\\n")+\\nexpr  ::= term ([-+*/] term)*\\nterm  ::= [0-9]+`,
      '1=1', [
        { type: RuleType.CHAR, value: [['0'.charCodeAt(0), '9'.charCodeAt(0)]], },
        { type: RuleType.CHAR, value: ['\n'.charCodeAt(0)], },
      ],
    ],
  ])('it parses a grammar `%s` against input: `%s`', (grammar, input, expected) => {
    const Parser = GBNF(grammar.split('\\n').join('\n'));
    const parser = new Parser(input);
    expect(parser.rules).toEqual(expected);
  });
});
