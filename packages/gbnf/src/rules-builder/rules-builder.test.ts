import { RulesBuilder } from './rules-builder.js';
import { InternalRuleDef, InternalRuleType, } from './types.js';

describe('Grammar Parser Tests', () => {
  test.each([
    [
      'single-string',
      `root ::= "foo"`,
      {
        "symbolIds": [["root", 0]],
        "rules": [
          [
            { "type": InternalRuleType.CHAR, "value": ['f'.charCodeAt(0)] },
            { "type": InternalRuleType.CHAR, "value": ['o'.charCodeAt(0)] },
            { "type": InternalRuleType.CHAR, "value": ['o'.charCodeAt(0)] },
            { "type": InternalRuleType.END }
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
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.END }],
          [
            { "type": InternalRuleType.CHAR, "value": ['b'.charCodeAt(0)] },
            { "type": InternalRuleType.CHAR, "value": ['a'.charCodeAt(0)] },
            { "type": InternalRuleType.CHAR, "value": ['r'.charCodeAt(0)] },
            { "type": InternalRuleType.END }
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
            { "type": InternalRuleType.RULE_REF, "value": 4 },
            { "type": InternalRuleType.END }],
          [
            { "type": InternalRuleType.RULE_REF, "value": 2 },
            { "type": InternalRuleType.CHAR, "value": [61] },
            { "type": InternalRuleType.RULE_REF, "value": 3 },
            { "type": InternalRuleType.CHAR, "value": [10] },
            { "type": InternalRuleType.END }
          ],
          [
            { "type": InternalRuleType.RULE_REF, "value": 3 },
            { "type": InternalRuleType.RULE_REF, "value": 6 },
            { "type": InternalRuleType.END }],
          [
            { "type": InternalRuleType.RULE_REF, "value": 7 },
            { "type": InternalRuleType.END }],
          [
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.RULE_REF, "value": 4 },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.END }
          ],
          [
            { "type": InternalRuleType.CHAR, "value": [45] },
            { "type": InternalRuleType.CHAR_ALT, "value": 43 },
            { "type": InternalRuleType.CHAR_ALT, "value": 42 },
            { "type": InternalRuleType.CHAR_ALT, "value": 47 },
            { "type": InternalRuleType.RULE_REF, "value": 3 },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.RULE_REF, "value": 5 },
            { "type": InternalRuleType.RULE_REF, "value": 6 },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.END }
          ],
          [
            { "type": InternalRuleType.CHAR, "value": [48] },
            { "type": InternalRuleType.CHAR_RNG_UPPER, "value": 57 },
            { "type": InternalRuleType.RULE_REF, "value": 7 },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.CHAR, "value": [48] },
            { "type": InternalRuleType.CHAR_RNG_UPPER, "value": 57 },
            { "type": InternalRuleType.END }
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
              { value: 5, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.END },
            ],
            [
              { value: 2, type: InternalRuleType.RULE_REF },
              { value: [61], type: InternalRuleType.CHAR },
              { value: 3, type: InternalRuleType.RULE_REF },
              { value: 4, type: InternalRuleType.RULE_REF },
              { value: [10], type: InternalRuleType.CHAR },
              { type: InternalRuleType.END },
            ],
            [
              { value: 4, type: InternalRuleType.RULE_REF },
              { value: 7, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.END },
            ],
            [
              { value: 12, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.END },
            ],
            [
              { value: 8, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.ALT },
              { value: 9, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.ALT },
              { value: [40], type: InternalRuleType.CHAR },
              { value: 3, type: InternalRuleType.RULE_REF },
              { value: 2, type: InternalRuleType.RULE_REF },
              { value: [41], type: InternalRuleType.CHAR },
              { value: 3, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.END },
            ],
            [
              { value: 1, type: InternalRuleType.RULE_REF },
              { value: 5, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.ALT },
              { value: 1, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.END },
            ],
            [
              { value: [45], type: InternalRuleType.CHAR },
              { value: 43, type: InternalRuleType.CHAR_ALT },
              { value: 42, type: InternalRuleType.CHAR_ALT },
              { value: 47, type: InternalRuleType.CHAR_ALT },
              { value: 4, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.END },
            ],
            [
              { value: 6, type: InternalRuleType.RULE_REF },
              { value: 7, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.ALT },
              { type: InternalRuleType.END },
            ],
            [
              { value: [97], type: InternalRuleType.CHAR },
              { value: 122, type: InternalRuleType.CHAR_RNG_UPPER },
              { value: 10, type: InternalRuleType.RULE_REF },
              { value: 3, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.END },
            ],
            [
              { value: 11, type: InternalRuleType.RULE_REF },
              { value: 3, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.END },
            ],
            [
              { value: [97], type: InternalRuleType.CHAR },
              { value: 122, type: InternalRuleType.CHAR_RNG_UPPER },
              { value: 48, type: InternalRuleType.CHAR_ALT },
              { value: 57, type: InternalRuleType.CHAR_RNG_UPPER },
              { value: 95, type: InternalRuleType.CHAR_ALT },
              { value: 10, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.ALT },
              { type: InternalRuleType.END },
            ],
            [
              { value: [48], type: InternalRuleType.CHAR },
              { value: 57, type: InternalRuleType.CHAR_RNG_UPPER },
              { value: 11, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.ALT },
              { value: [48], type: InternalRuleType.CHAR },
              { value: 57, type: InternalRuleType.CHAR_RNG_UPPER },
              { type: InternalRuleType.END },
            ],
            [
              { value: [32], type: InternalRuleType.CHAR },
              { value: 9, type: InternalRuleType.CHAR_ALT },
              { value: 10, type: InternalRuleType.CHAR_ALT },
              { value: 12, type: InternalRuleType.RULE_REF },
              { type: InternalRuleType.ALT },
              { type: InternalRuleType.END },
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
          { "type": InternalRuleType.CHAR, "value": ['ぁ'.charCodeAt(0)] },
          { "type": InternalRuleType.CHAR_RNG_UPPER, "value": 'ゟ'.charCodeAt(0) },
          { "type": InternalRuleType.END },
        ]]
      }
    ],
    [
      'character alts grammar',
      `root  ::= [az]`,
      {
        "symbolIds": [["root", 0]],
        "rules": [[
          { "type": InternalRuleType.CHAR, "value": ['a'.charCodeAt(0)] },
          { "type": InternalRuleType.CHAR_ALT, "value": 'z'.charCodeAt(0) },
          { "type": InternalRuleType.END },
        ]]
      }
    ],
    [
      'character range grammar',
      `root  ::= [a-zA-Z0-9]`,
      {
        "symbolIds": [["root", 0]],
        "rules": [[
          { "type": InternalRuleType.CHAR, "value": ['a'.charCodeAt(0)] },
          { "type": InternalRuleType.CHAR_RNG_UPPER, "value": 'z'.charCodeAt(0) },
          { "type": InternalRuleType.CHAR_ALT, "value": 'A'.charCodeAt(0) },
          { "type": InternalRuleType.CHAR_RNG_UPPER, "value": 'Z'.charCodeAt(0) },
          { "type": InternalRuleType.CHAR_ALT, "value": '0'.charCodeAt(0) },
          { "type": InternalRuleType.CHAR_RNG_UPPER, "value": '9'.charCodeAt(0) },
          { "type": InternalRuleType.END },
        ]]
      }
    ],
    [
      'character range grammar with dash at end',
      `root  ::= [a-z-]`,
      {
        "symbolIds": [["root", 0]],
        "rules": [[
          { "type": InternalRuleType.CHAR, "value": ['a'.charCodeAt(0)] },
          { "type": InternalRuleType.CHAR_RNG_UPPER, "value": 'z'.charCodeAt(0) },
          { "type": InternalRuleType.CHAR_ALT, "value": '-'.charCodeAt(0) },
          { "type": InternalRuleType.END },
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
            { "type": InternalRuleType.CHAR, "value": ['f'.charCodeAt(0)] },
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.CHAR, "value": ['b'.charCodeAt(0)] },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.CHAR, "value": ['a'.charCodeAt(0)] },
            { "type": InternalRuleType.END },
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
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.END }],
          [
            { "type": InternalRuleType.CHAR, "value": ['f'.charCodeAt(0)] },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.END }],
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
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.END }],
          [
            { "type": InternalRuleType.CHAR, "value": ['f'.charCodeAt(0)] },
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.END }],
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
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.END }],
          [
            { "type": InternalRuleType.CHAR, "value": ['f'.charCodeAt(0)] },
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.CHAR, "value": ['f'.charCodeAt(0)] },
            { "type": InternalRuleType.END }],
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
            { "type": InternalRuleType.RULE_REF, value: 1 },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.CHAR, "value": ['a'.charCodeAt(0)] },
            { "type": InternalRuleType.CHAR_RNG_UPPER, "value": 'z'.charCodeAt(0) },
            { "type": InternalRuleType.CHAR_ALT, "value": 'A'.charCodeAt(0) },
            { "type": InternalRuleType.CHAR_RNG_UPPER, "value": 'Z'.charCodeAt(0) },
            { "type": InternalRuleType.CHAR_ALT, "value": '0'.charCodeAt(0) },
            { "type": InternalRuleType.CHAR_RNG_UPPER, "value": '9'.charCodeAt(0) },
            { "type": InternalRuleType.RULE_REF, value: 1 },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.END },
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
            { "type": InternalRuleType.CHAR, "value": ['f'.charCodeAt(0)] },
            { "type": InternalRuleType.RULE_REF, "value": 2 },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.CHAR, "value": ['b'.charCodeAt(0)] },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.CHAR, "value": ['a'.charCodeAt(0)] },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.RULE_REF, "value": 2 },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.END },
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
            { "type": InternalRuleType.CHAR_NOT, "value": '\n'.charCodeAt(0) },
            { "type": InternalRuleType.END },
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
            { "type": InternalRuleType.CHAR_NOT, "value": '0'.charCodeAt(0) },
            { "type": InternalRuleType.CHAR_RNG_UPPER, "value": '9'.charCodeAt(0) },
            { "type": InternalRuleType.END },
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
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.CHAR, "value": ['\n'.charCodeAt(0)] },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.CHAR_NOT, "value": '\n'.charCodeAt(0) },
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.ALT },
            { "type": InternalRuleType.CHAR_NOT, "value": '\n'.charCodeAt(0) },
            { "type": InternalRuleType.END },
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
            { "type": InternalRuleType.CHAR, "value": [actualChar] },
            { "type": InternalRuleType.END },
          ],
        ]
      }
    ] as [string, string, { symbolIds: [string[]], rules: InternalRuleDef[][] }])),
    [
      'simple arithmetic',
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
          ["term_7", 7],
        ],
        "rules": [
          [
            { "type": InternalRuleType.RULE_REF, "value": 4 },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.RULE_REF, "value": 2 },
            { "type": InternalRuleType.CHAR, "value": [61] },
            { "type": InternalRuleType.RULE_REF, "value": 3 },
            { "type": InternalRuleType.CHAR, "value": [10] },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.RULE_REF, "value": 3 },
            { "type": InternalRuleType.RULE_REF, "value": 6 },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.RULE_REF, "value": 7 },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.RULE_REF, "value": 4 },
            { "type": InternalRuleType.ALT, },
            { "type": InternalRuleType.RULE_REF, "value": 1 },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.CHAR, "value": [45] },
            { "type": InternalRuleType.CHAR_ALT, "value": 43 },
            { "type": InternalRuleType.CHAR_ALT, "value": 42 },
            { "type": InternalRuleType.CHAR_ALT, "value": 47 },
            { "type": InternalRuleType.RULE_REF, "value": 3 },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.RULE_REF, "value": 5 },
            { "type": InternalRuleType.RULE_REF, "value": 6 },
            { "type": InternalRuleType.ALT, },
            { "type": InternalRuleType.END },
          ],
          [
            { "type": InternalRuleType.CHAR, "value": [48] },
            { "type": InternalRuleType.CHAR_RNG_UPPER, "value": 57 },
            { "type": InternalRuleType.RULE_REF, "value": 7 },
            { "type": InternalRuleType.ALT, },
            { "type": InternalRuleType.CHAR, "value": [48] },
            { "type": InternalRuleType.CHAR_RNG_UPPER, "value": 57 },
            { "type": InternalRuleType.END },
          ],
        ]
      }
    ],
  ])('parses grammar %s', (_key, grammar, { symbolIds, rules }) => {
    const parsedGrammar = new RulesBuilder(grammar);
    expect(Array.from(parsedGrammar.symbolIds.entries())).toEqual(symbolIds);
    expect(parsedGrammar.rules).toEqual(rules);
  });
});
