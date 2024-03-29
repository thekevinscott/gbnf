import { RuleDef, RuleType } from "../types";
import { buildRuleStack, } from "./build-rule-stack";

describe('buildRuleStack', () => {
  test('it builds rule stack for a single path', () => {
    expect(buildRuleStack([
      { type: RuleType.CHAR, value: 120, },
    ])).toEqual([[
      { type: RuleType.CHAR, value: 120, },
      { type: RuleType.END, },
    ]]);
  });

  test('it builds rule stack for two alternate paths', () => {
    expect(buildRuleStack([
      { type: RuleType.CHAR, value: 120, },
      { type: RuleType.ALT, },
      { type: RuleType.CHAR, value: 121, },
    ])).toEqual([[
      { type: RuleType.CHAR, value: 120, },
      { type: RuleType.END, },
    ], [
      { type: RuleType.CHAR, value: 121, },
      { type: RuleType.END, },
    ]]);
  });

  test('it builds rule stack for three alternate paths', () => {
    expect(buildRuleStack([
      { type: RuleType.CHAR, value: 120, },
      { type: RuleType.ALT, },
      { type: RuleType.CHAR, value: 121, },
      { type: RuleType.ALT, },
      { type: RuleType.CHAR, value: 122, },
    ])).toEqual([[
      { type: RuleType.CHAR, value: 120, },
      { type: RuleType.END, },
    ], [
      { type: RuleType.CHAR, value: 121, },
      { type: RuleType.END, },
    ], [
      { type: RuleType.CHAR, value: 122, },
      { type: RuleType.END, },
    ]]);
  });

  describe('range', () => {
    describe('no modifiers', () => {
      test.each([
        [`[a-z]`, [
          { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
          { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
          { type: RuleType.END, },
        ], [[
          { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),]], },
          { type: RuleType.END, },
        ]]],
        [
          `[a-zA-Z]`,
          [
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: 'A'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'Z'.charCodeAt(0), },
            { type: RuleType.END, },
          ],
          [
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),], ['A'.charCodeAt(0), 'Z'.charCodeAt(0),]], },
              { type: RuleType.END, },
            ],
          ]
        ],
        [
          `[a-zA-Z0-9]`,
          [
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: 'A'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'Z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: '0'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: '9'.charCodeAt(0), },
            { type: RuleType.END, },
          ],
          [
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),], ['A'.charCodeAt(0), 'Z'.charCodeAt(0),], ['0'.charCodeAt(0), '9'.charCodeAt(0),]], },
              { type: RuleType.END, },
            ],
          ]
        ],
      ] as [string, RuleDef[], RuleDef[][]][])('it builds rule stack for a range `%s`', (_grammar, input, expected) => {
        expect(buildRuleStack(input)).toEqual(expected);
      });
    });

    describe('?', () => {
      test.each([
        [
          `[a-z]?`,
          [
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.ALT, },
            { type: RuleType.END, },

          ],
          [[
            { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),]], },
            { type: RuleType.END, },
          ], [
            { type: RuleType.END, },

          ]],
        ],
        [
          `[a-zA-Z]?`,
          [
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: 'A'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'Z'.charCodeAt(0), },
            { type: RuleType.ALT, },
            { type: RuleType.END, },
          ],
          [
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),], ['A'.charCodeAt(0), 'Z'.charCodeAt(0),]], },
              { type: RuleType.END, },
            ],
            [
              { type: RuleType.END, },

            ]
          ]
        ],
        [
          `[a-zA-Z0-9]?`,
          [
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: 'A'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'Z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: '0'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: '9'.charCodeAt(0), },
            { type: RuleType.ALT, },
            { type: RuleType.END, },
          ],
          [
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),], ['A'.charCodeAt(0), 'Z'.charCodeAt(0),], ['0'.charCodeAt(0), '9'.charCodeAt(0),]], },
              { type: RuleType.END, },
            ],
            [
              { type: RuleType.END, },

            ],
          ]
        ],
      ] as [string, RuleDef[], RuleDef[][]][])('it builds rule stack for a range `%s`', (_grammar, input, expected) => {
        expect(buildRuleStack(input)).toEqual(expected);
      });
    });

    describe('+', () => {
      test.each([
        [
          `[a-z]+`,
          [
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.RULE_REF, value: 1 },
            { type: RuleType.ALT, },
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.END, },
          ],
          [
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),]], },
              { type: RuleType.RULE_REF, value: 1 },
              { type: RuleType.END, },
            ],
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),]], },
              { type: RuleType.END, },
            ],
          ],
        ],
        [
          `[a-zA-Z]+`,
          [
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: 'A'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'Z'.charCodeAt(0), },
            { type: RuleType.RULE_REF, value: 1 },
            { type: RuleType.ALT, },
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: 'A'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'Z'.charCodeAt(0), },
            { type: RuleType.END, },
          ],
          [
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),], ['A'.charCodeAt(0), 'Z'.charCodeAt(0),],], },
              { type: RuleType.RULE_REF, value: 1 },
              { type: RuleType.END, },
            ],
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),], ['A'.charCodeAt(0), 'Z'.charCodeAt(0),],], },
              { type: RuleType.END, },
            ],
          ]
        ],
        [
          `[a-zA-Z0-9]+`,
          [
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: 'A'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'Z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: '0'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: '9'.charCodeAt(0), },
            { type: RuleType.RULE_REF, value: 1 },
            { type: RuleType.ALT, },
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: 'A'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'Z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: '0'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: '9'.charCodeAt(0), },
            { type: RuleType.END, },
          ],
          [
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),], ['A'.charCodeAt(0), 'Z'.charCodeAt(0),], ['0'.charCodeAt(0), '9'.charCodeAt(0),]], },
              { type: RuleType.RULE_REF, value: 1 },
              { type: RuleType.END, },
            ],
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),], ['A'.charCodeAt(0), 'Z'.charCodeAt(0),], ['0'.charCodeAt(0), '9'.charCodeAt(0),]], },
              { type: RuleType.END, },
            ],
          ]
        ],
      ] as [string, RuleDef[], RuleDef[][]][])('it builds rule stack for a range `%s`', (_grammar, input, expected) => {
        expect(buildRuleStack(input)).toEqual(expected);
      });
    });

    describe('*', () => {
      test.each([
        [`[a-z]*`, [
          { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
          { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
          { type: RuleType.RULE_REF, value: 1, },
          { type: RuleType.ALT, },
          { type: RuleType.END, },
        ], [[
          { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),],], },
          { type: RuleType.RULE_REF, value: 1, },
          { type: RuleType.END, },
        ], [
          { type: RuleType.END, },
        ]]],
        [
          `[a-zA-Z]*`,
          [
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: 'A'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'Z'.charCodeAt(0), },
            { type: RuleType.RULE_REF, value: 1, },
            { type: RuleType.ALT, },
            { type: RuleType.END, },
          ],
          [
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),], ['A'.charCodeAt(0), 'Z'.charCodeAt(0),],], },
              { type: RuleType.RULE_REF, value: 1, },
              { type: RuleType.END, },
            ],
            [
              { type: RuleType.END, },
            ],
          ]
        ],
        [
          `[a-zA-Z0-9]*`,
          [
            { type: RuleType.CHAR, value: 'a'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: 'A'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: 'Z'.charCodeAt(0), },
            { type: RuleType.CHAR_ALT, value: '0'.charCodeAt(0), },
            { type: RuleType.CHAR_RNG_UPPER, value: '9'.charCodeAt(0), },
            { type: RuleType.RULE_REF, value: 1, },
            { type: RuleType.ALT, },
            { type: RuleType.END, },
          ],
          [
            [
              { type: RuleType.RANGE, value: [['a'.charCodeAt(0), 'z'.charCodeAt(0),], ['A'.charCodeAt(0), 'Z'.charCodeAt(0),], ['0'.charCodeAt(0), '9'.charCodeAt(0),]], },
              { type: RuleType.RULE_REF, value: 1, },
              { type: RuleType.END, },
            ],
            [
              { type: RuleType.END, },
            ],
          ]
        ],
      ] as [string, RuleDef[], RuleDef[][]][])('it builds rule stack for an optionally repeating range `%s`', (_grammar, input, expected) => {
        expect(buildRuleStack(input)).toEqual(expected);
      });
    });
  });

  test.each([
    [
      'root  ::= (ws )+\\nws    ::= [ \\\\t\\\\n]*',
      [
        { type: RuleType.CHAR, value: [32] },
        { type: RuleType.CHAR_ALT, value: 92 },
        { type: RuleType.CHAR_ALT, value: 110 },
        { type: RuleType.RULE_REF, value: 4 },
        { type: RuleType.ALT },
        { type: RuleType.END },
      ],
      [
        [
          { type: RuleType.CHAR, value: [32, 92, 110], },
          { type: RuleType.RULE_REF, value: 4 },
          { type: RuleType.END }
        ],
        [
          { type: RuleType.END }

        ],
      ]
    ],
  ] as [string, RuleDef[], RuleDef[][]][])('it builds rule stack for situation `%s`', (key, input, expected) => {
    expect(buildRuleStack(input)).toEqual(expected);
  });
});
