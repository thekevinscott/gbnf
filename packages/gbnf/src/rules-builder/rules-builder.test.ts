import { RulesBuilder } from './rules-builder.js';
import { RuleDef, RuleType } from '../types.js';

describe('Grammar Parser Tests', () => {
  test.each([
    [
      'single-string',
      `root ::= "foo"`,
      {
        "symbolIds": [["root", 0]],
        "rules": [
          [
            { "type": RuleType.CHAR, "value": 'f'.charCodeAt(0) },
            { "type": RuleType.CHAR, "value": 'o'.charCodeAt(0) },
            { "type": RuleType.CHAR, "value": 'o'.charCodeAt(0) },
            { "type": RuleType.END }
          ]
        ]
      }

    ],
    [
      'two-lines-referencing-expression',
      `root ::= foo
      foo  ::= "bar"
      `,
      {
        "symbolIds": [
          ["root", 0],
          ["foo", 1]
        ],
        "rules": [
          [
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.END }],
          [
            { "type": RuleType.CHAR, "value": 'b'.charCodeAt(0) },
            { "type": RuleType.CHAR, "value": 'a'.charCodeAt(0) },
            { "type": RuleType.CHAR, "value": 'r'.charCodeAt(0) },
            { "type": RuleType.END }
          ]
        ]
      }
    ],
    [
      'simple-grammar',
      `
root  ::= (expr "=" term "\n")+
      expr  ::= term ([-+*/] term)*
  term  ::= [0-9]+

      `,
      {
        "symbolIds": [
          ["root", 0],
          ["root_1", 1],
          ["expr", 2],
          ["term", 3],
          ["root_4", 4],
          ["expr_5", 5],
          ["expr_6", 6],
          ["term_7", 7]
        ],
        "rules": [


          [
            { "type": RuleType.RULE_REF, "value": 4 },
            { "type": RuleType.END }],
          [
            { "type": RuleType.RULE_REF, "value": 2 },
            { "type": RuleType.CHAR, "value": 61 },
            { "type": RuleType.RULE_REF, "value": 3 },
            { "type": RuleType.CHAR, "value": 10 },
            { "type": RuleType.END }
          ],
          [
            { "type": RuleType.RULE_REF, "value": 3 },
            { "type": RuleType.RULE_REF, "value": 6 },
            { "type": RuleType.END }],
          [
            { "type": RuleType.RULE_REF, "value": 7 },
            { "type": RuleType.END }],
          [
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.RULE_REF, "value": 4 },
            { "type": RuleType.ALT },
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.END }
          ],
          [
            { "type": RuleType.CHAR, "value": 45 },
            { "type": RuleType.CHAR_ALT, "value": 43 },
            { "type": RuleType.CHAR_ALT, "value": 42 },
            { "type": RuleType.CHAR_ALT, "value": 47 },
            { "type": RuleType.RULE_REF, "value": 3 },
            { "type": RuleType.END },
          ],
          [
            { "type": RuleType.RULE_REF, "value": 5 },
            { "type": RuleType.RULE_REF, "value": 6 },
            { "type": RuleType.ALT },
            { "type": RuleType.END }
          ],
          [
            { "type": RuleType.CHAR, "value": 48 },
            { "type": RuleType.CHAR_RNG_UPPER, "value": 57 },
            { "type": RuleType.RULE_REF, "value": 7 },
            { "type": RuleType.ALT },
            { "type": RuleType.CHAR, "value": 48 },
            { "type": RuleType.CHAR_RNG_UPPER, "value": 57 },
            { "type": RuleType.END }
          ]
        ]
      }
    ],
    [
      'longer-grammar',
      `root  ::= (expr "=" ws term "\n")+
  expr  ::= term ([-+*/] term)*
  term  ::= ident | num | "(" ws expr ")" ws
  ident ::= [a-z] [a-z0-9_]* ws
  num   ::= [0-9]+ ws
  ws    ::= [ \t\n]*`,
      {
        "symbolIds": [
          ["root", 0],
          ["root_1", 1],
          ["expr", 2],
          ["ws", 3],
          ["term", 4],
          ["root_5", 5],
          ["expr_6", 6],
          ["expr_7", 7],
          ["ident", 8],
          ["num", 9],
          ["ident_10", 10],
          ["num_11", 11],
          ["ws_12", 12],
        ],
        "rules":
          [
            [
              { value: 5, type: RuleType.RULE_REF },
              { type: RuleType.END },
            ],
            [
              { value: 2, type: RuleType.RULE_REF },
              { value: 61, type: RuleType.CHAR },
              { value: 3, type: RuleType.RULE_REF },
              { value: 4, type: RuleType.RULE_REF },
              { value: 10, type: RuleType.CHAR },
              { type: RuleType.END },
            ],
            [
              { value: 4, type: RuleType.RULE_REF },
              { value: 7, type: RuleType.RULE_REF },
              { type: RuleType.END },
            ],
            [
              { value: 12, type: RuleType.RULE_REF },
              { type: RuleType.END },
            ],
            [
              { value: 8, type: RuleType.RULE_REF },
              { type: RuleType.ALT },
              { value: 9, type: RuleType.RULE_REF },
              { type: RuleType.ALT },
              { value: 40, type: RuleType.CHAR },
              { value: 3, type: RuleType.RULE_REF },
              { value: 2, type: RuleType.RULE_REF },
              { value: 41, type: RuleType.CHAR },
              { value: 3, type: RuleType.RULE_REF },
              { type: RuleType.END },
            ],
            [
              { value: 1, type: RuleType.RULE_REF },
              { value: 5, type: RuleType.RULE_REF },
              { type: RuleType.ALT },
              { value: 1, type: RuleType.RULE_REF },
              { type: RuleType.END },
            ],
            [
              { value: 45, type: RuleType.CHAR },
              { value: 43, type: RuleType.CHAR_ALT },
              { value: 42, type: RuleType.CHAR_ALT },
              { value: 47, type: RuleType.CHAR_ALT },
              { value: 4, type: RuleType.RULE_REF },
              { type: RuleType.END },
            ],
            [
              { value: 6, type: RuleType.RULE_REF },
              { value: 7, type: RuleType.RULE_REF },
              { type: RuleType.ALT },
              { type: RuleType.END },
            ],
            [
              { value: 97, type: RuleType.CHAR },
              { value: 122, type: RuleType.CHAR_RNG_UPPER },
              { value: 10, type: RuleType.RULE_REF },
              { value: 3, type: RuleType.RULE_REF },
              { type: RuleType.END },
            ],
            [
              { value: 11, type: RuleType.RULE_REF },
              { value: 3, type: RuleType.RULE_REF },
              { type: RuleType.END },
            ],
            [
              { value: 97, type: RuleType.CHAR },
              { value: 122, type: RuleType.CHAR_RNG_UPPER },
              { value: 48, type: RuleType.CHAR_ALT },
              { value: 57, type: RuleType.CHAR_RNG_UPPER },
              { value: 95, type: RuleType.CHAR_ALT },
              { value: 10, type: RuleType.RULE_REF },
              { type: RuleType.ALT },
              { type: RuleType.END },
            ],
            [
              { value: 48, type: RuleType.CHAR },
              { value: 57, type: RuleType.CHAR_RNG_UPPER },
              { value: 11, type: RuleType.RULE_REF },
              { type: RuleType.ALT },
              { value: 48, type: RuleType.CHAR },
              { value: 57, type: RuleType.CHAR_RNG_UPPER },
              { type: RuleType.END },
            ],
            [
              { value: 32, type: RuleType.CHAR },
              { value: 9, type: RuleType.CHAR_ALT },
              { value: 10, type: RuleType.CHAR_ALT },
              { value: 12, type: RuleType.RULE_REF },
              { type: RuleType.ALT },
              { type: RuleType.END },
            ]
          ],
      },
    ],


    [
      'character unicode grammar',
      `root  ::= [ぁ-ゟ]`,
      {
        "symbolIds": [["root", 0]],
        "rules": [[
          { "type": RuleType.CHAR, "value": 'ぁ'.charCodeAt(0) },
          { "type": RuleType.CHAR_RNG_UPPER, "value": 'ゟ'.charCodeAt(0) },
          { "type": RuleType.END },
        ]]
      }
    ],
    [
      'character alts grammar',
      `root  ::= [az]`,
      {
        "symbolIds": [["root", 0]],
        "rules": [[
          { "type": RuleType.CHAR, "value": 'a'.charCodeAt(0) },
          { "type": RuleType.CHAR_ALT, "value": 'z'.charCodeAt(0) },
          { "type": RuleType.END },
        ]]
      }
    ],
    [
      'character range grammar',
      `root  ::= [a-zA-Z0-9]`,
      {
        "symbolIds": [["root", 0]],
        "rules": [[
          { "type": RuleType.CHAR, "value": 'a'.charCodeAt(0) },
          { "type": RuleType.CHAR_RNG_UPPER, "value": 'z'.charCodeAt(0) },
          { "type": RuleType.CHAR_ALT, "value": 'A'.charCodeAt(0) },
          { "type": RuleType.CHAR_RNG_UPPER, "value": 'Z'.charCodeAt(0) },
          { "type": RuleType.CHAR_ALT, "value": '0'.charCodeAt(0) },
          { "type": RuleType.CHAR_RNG_UPPER, "value": '9'.charCodeAt(0) },
          { "type": RuleType.END },
        ]]
      }
    ],
    [
      'character range grammar with dash at end',
      `root  ::= [a-z-]`,
      {
        "symbolIds": [["root", 0]],
        "rules": [[
          { "type": RuleType.CHAR, "value": 'a'.charCodeAt(0) },
          { "type": RuleType.CHAR_RNG_UPPER, "value": 'z'.charCodeAt(0) },
          { "type": RuleType.CHAR_ALT, "value": '-'.charCodeAt(0) },
          { "type": RuleType.END },
        ]]
      }
    ],
    [
      'grouping',
      `root  ::= "f" ("b" | "a")`,
      {
        "symbolIds": [
          ["root", 0],
          ["root_1", 1]
        ],
        "rules": [
          [
            { "type": RuleType.CHAR, "value": 'f'.charCodeAt(0) },
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.END },
          ],
          [
            { "type": RuleType.CHAR, "value": 'b'.charCodeAt(0) },
            { "type": RuleType.ALT },
            { "type": RuleType.CHAR, "value": 'a'.charCodeAt(0) },
            { "type": RuleType.END },
          ],
        ]
      }
    ],
    [
      'optional',
      `root  ::= "f"?`,
      {
        "symbolIds": [
          ["root", 0],
          ["root_1", 1]
        ],
        "rules": [
          [
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.END }],
          [
            { "type": RuleType.CHAR, "value": 'f'.charCodeAt(0) },
            { "type": RuleType.ALT },
            { "type": RuleType.END }],
        ]
      }
    ],
    [
      'repeating',
      `root  ::= "f"*`,
      {
        "symbolIds": [
          ["root", 0],
          ["root_1", 1]
        ],
        "rules": [
          [
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.END }],
          [
            { "type": RuleType.CHAR, "value": 'f'.charCodeAt(0) },
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.ALT },
            { "type": RuleType.END }],
        ]
      }
    ],
    [
      'repeating-at-least-once',
      `root  ::= "f"+`,
      {
        "symbolIds": [
          ["root", 0],
          ["root_1", 1]
        ],
        "rules": [
          [
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.END }],
          [
            { "type": RuleType.CHAR, "value": 'f'.charCodeAt(0) },
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.ALT },
            { "type": RuleType.CHAR, "value": 'f'.charCodeAt(0) },
            { "type": RuleType.END }],
        ]
      }
    ],
    [
      'character range with optional repeating',
      `root  ::= [a-zA-Z0-9]*`,
      {
        "symbolIds": [["root", 0], ["root_1", 1]],
        "rules": [
          [
            { "type": RuleType.RULE_REF, value: 1 },
            { "type": RuleType.END },
          ],
          [
            { "type": RuleType.CHAR, "value": 'a'.charCodeAt(0) },
            { "type": RuleType.CHAR_RNG_UPPER, "value": 'z'.charCodeAt(0) },
            { "type": RuleType.CHAR_ALT, "value": 'A'.charCodeAt(0) },
            { "type": RuleType.CHAR_RNG_UPPER, "value": 'Z'.charCodeAt(0) },
            { "type": RuleType.CHAR_ALT, "value": '0'.charCodeAt(0) },
            { "type": RuleType.CHAR_RNG_UPPER, "value": '9'.charCodeAt(0) },
            { "type": RuleType.RULE_REF, value: 1 },
            { "type": RuleType.ALT },
            { "type": RuleType.END },
          ],
        ]
      }
    ],
    [
      'grouping-repeating',
      `root  ::= "f" ("b" | "a")*`,
      {
        "symbolIds": [
          [
            "root",
            0
          ],
          [
            "root_1",
            1
          ],
          [
            "root_2",
            2
          ]
        ],
        "rules": [
          [
            { "type": RuleType.CHAR, "value": 'f'.charCodeAt(0) },
            { "type": RuleType.RULE_REF, "value": 2 },
            { "type": RuleType.END },
          ],
          [
            { "type": RuleType.CHAR, "value": 'b'.charCodeAt(0) },
            { "type": RuleType.ALT },
            { "type": RuleType.CHAR, "value": 'a'.charCodeAt(0) },
            { "type": RuleType.END },
          ],
          [
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.RULE_REF, "value": 2 },
            { "type": RuleType.ALT },
            { "type": RuleType.END },
          ]
        ]
      }
    ],
    [
      'negation',
      `root ::= [^\n]`,
      {
        "symbolIds": [
          [
            "root",
            0
          ],
        ],
        "rules": [
          [
            { "type": RuleType.CHAR_NOT, "value": '\n'.charCodeAt(0) },
            { "type": RuleType.END },
          ],
        ]
      }
    ],
    [
      'negation of range',
      `root ::= [^0-9]`,
      {
        "symbolIds": [
          [
            "root",
            0
          ],
        ],
        "rules": [
          [
            { "type": RuleType.CHAR_NOT, "value": '0'.charCodeAt(0) },
            { "type": RuleType.CHAR_RNG_UPPER, "value": '9'.charCodeAt(0) },
            { "type": RuleType.END },
          ],
        ]
      }
    ],
    [
      'negation with after',
      "root ::= [^\n]+ \"\n\"",
      {
        "symbolIds": [
          ["root", 0],
          ["root_1", 1],
        ],
        "rules": [
          [
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.CHAR, "value": '\n'.charCodeAt(0) },
            { "type": RuleType.END },
          ],
          [
            { "type": RuleType.CHAR_NOT, "value": '\n'.charCodeAt(0) },
            { "type": RuleType.RULE_REF, "value": 1 },
            { "type": RuleType.ALT },
            { "type": RuleType.CHAR_NOT, "value": '\n'.charCodeAt(0) },
            { "type": RuleType.END },
          ],
        ]
      }
    ],
    ...[
      [
        'escaped 8-bit unicode char',
        '\\x2A',
        '\x2A'.charCodeAt(0),
      ],
      [
        'escaped 16-bit unicode char',
        '\\u006F',
        '\u006F'.charCodeAt(0),
      ],
      [
        'escaped 32-bit unicode char',
        "\\U0001F4A9",
        128169,
      ],
      [
        'escaped tab char',
        "\\t",
        '\t'.charCodeAt(0),
      ],
      [
        'escaped new line char',
        "\\n",
        '\n'.charCodeAt(0),
      ],
      [
        'escaped \r char',
        "\\r",
        '\r'.charCodeAt(0),
      ],
      [
        'escaped quote char',
        "\\\"",
        '"'.charCodeAt(0),
      ],
      [
        'escaped [ char',
        "\\[",
        '['.charCodeAt(0),
      ],
      [
        'escaped ] char',
        "\\]",
        ']'.charCodeAt(0),
      ],
      [
        'escaped \ char',
        "\\\\",
        '\\'.charCodeAt(0),
      ],
    ].map(([key, escapedChar, actualChar,],) => ([
      key,
      `root ::= "\\${escapedChar}"`,
      {
        "symbolIds": [["root", 0],],
        "rules": [
          [
            { "type": RuleType.CHAR, "value": actualChar },
            { "type": RuleType.END },
          ],
        ]
      }
    ] as [string, string, { symbolIds: [string[]], rules: RuleDef[][] }])),
  ])('parses grammar %s', (_key, grammar, { symbolIds, rules }) => {
    const parsedGrammar = new RulesBuilder(grammar);
    expect(Array.from(parsedGrammar.symbolIds.entries())).toEqual(symbolIds);
    expect(parsedGrammar.rules).toEqual(rules);
  });
});
