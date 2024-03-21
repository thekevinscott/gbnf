import { parse } from "./index.js";

const grammarBytes = `root  ::= (expr "=" term "\n")+
expr  ::= term ([-+*/] term)*
term  ::= [0-9]+`;
describe('parse', () => {
  it.each([
    [0, "expr", 2],
    [1, "expr_5", 5],
    [2, "expr_6", 6],
    [3, "root", 0],
    [4, "root_1", 1],
    [5, "root_4", 4],
    [6, "term", 3],
    [7, "term_7", 7],
  ])('parses a simple grammar and finds symbol id (%i %s %i)', (index, key, value) => {
    const parsedGrammar = parse(grammarBytes);
    console.log(parsedGrammar.symbolIds)
    expect(parsedGrammar.symbolIds.size).toEqual(8);
    expect(parsedGrammar.symbolIds.get(key)).toEqual(value);
  });

  // const expectedRules: LlamaGrammarElement[] = [
  //   { type: LlamaGrammarElementType.RULE_REF, value: 4 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 2 },
  //   { type: LlamaGrammarElementType.CHAR, value: 61 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 3 },
  //   { type: LlamaGrammarElementType.CHAR, value: 10 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 3 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 6 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 7 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 1 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 4 },
  //   { type: LlamaGrammarElementType.ALT, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 1 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.CHAR, value: 45 },
  //   { type: LlamaGrammarElementType.CHAR_ALT, value: 43 },
  //   { type: LlamaGrammarElementType.CHAR_ALT, value: 42 },
  //   { type: LlamaGrammarElementType.CHAR_ALT, value: 47 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 3 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 5 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 6 },
  //   { type: LlamaGrammarElementType.ALT, value: 0 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.CHAR, value: 48 },
  //   { type: LlamaGrammarElementType.CHAR_RNG_UPPER, value: 57 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 7 },
  //   { type: LlamaGrammarElementType.ALT, value: 0 },
  //   { type: LlamaGrammarElementType.CHAR, value: 48 },
  //   { type: LlamaGrammarElementType.CHAR_RNG_UPPER, value: 57 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  // ];

  // index = 0;
  // for (const rule of parsedGrammar.rules) {
  //   for (let i = 0; i < rule.length; i++) {
  //     const element = rule[i];
  //     const expectedElement = expectedRules[index];

  //     if (expectedElement.type !== element.type || expectedElement.value !== element.value) {
  //       console.error(`index: ${index}`);
  //       console.error(`expected_element: ${expectedElement.type}, ${expectedElement.value}`);
  //       console.error(`actual_element: ${element.type}, ${element.value}`);
  //       console.error(`expected_element != actual_element`);
  //     }

  //     console.assert(expectedElement.type === element.type && expectedElement.value === element.value);
  //     index++;
  //   }
  // }

  // const longerGrammarBytes = `
  //   root  ::= (expr "=" ws term "\n")+
  //   expr  ::= term ([-+*/] term)*
  //   term  ::= ident | num | "(" ws expr ")" ws
  //   ident ::= [a-z] [a-z0-9_]* ws
  //   num   ::= [0-9]+ ws
  //   ws    ::= [ \t\n]*
  //   `;

  // parsedGrammar = parse(longerGrammarBytes);

  // const expectedSymbolIdsLonger: [string, number][] = [
  //   ["expr", 2],
  //   ["expr_6", 6],
  //   ["expr_7", 7],
  //   ["ident", 8],
  //   ["ident_10", 10],
  //   ["num", 9],
  //   ["num_11", 11],
  //   ["root", 0],
  //   ["root_1", 1],
  //   ["root_5", 5],
  //   ["term", 4],
  //   ["ws", 3],
  //   ["ws_12", 12],
  // ];

  // index = 0;
  // for (const [key, value] of parsedGrammar.symbolIds.entries()) {
  //   const [expectedKey, expectedValue] = expectedSymbolIdsLonger[index];

  //   if (expectedKey !== key || expectedValue !== value) {
  //     console.error(`expected_pair: ${expectedKey}, ${expectedValue}`);
  //     console.error(`actual_pair: ${key}, ${value}`);
  //     console.error(`expected_pair != actual_pair`);
  //   }

  //   console.assert(expectedKey === key && expectedValue === value);

  //   index++;
  // }

  // const expectedRulesLonger: LlamaGrammarElement[] = [
  //   { type: LlamaGrammarElementType.RULE_REF, value: 5 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 2 },
  //   { type: LlamaGrammarElementType.CHAR, value: 61 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 3 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 4 },
  //   { type: LlamaGrammarElementType.CHAR, value: 10 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 4 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 7 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 12 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 8 },
  //   { type: LlamaGrammarElementType.ALT, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 9 },
  //   { type: LlamaGrammarElementType.ALT, value: 0 },
  //   { type: LlamaGrammarElementType.CHAR, value: 40 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 3 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 2 },
  //   { type: LlamaGrammarElementType.CHAR, value: 41 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 3 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 1 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 5 },
  //   { type: LlamaGrammarElementType.ALT, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 1 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.CHAR, value: 45 },
  //   { type: LlamaGrammarElementType.CHAR_ALT, value: 43 },
  //   { type: LlamaGrammarElementType.CHAR_ALT, value: 42 },
  //   { type: LlamaGrammarElementType.CHAR_ALT, value: 47 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 4 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 6 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 7 },
  //   { type: LlamaGrammarElementType.ALT, value: 0 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.CHAR, value: 97 },
  //   { type: LlamaGrammarElementType.CHAR_RNG_UPPER, value: 122 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 10 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 3 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 11 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 3 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.CHAR, value: 97 },
  //   { type: LlamaGrammarElementType.CHAR_RNG_UPPER, value: 122 },
  //   { type: LlamaGrammarElementType.CHAR_ALT, value: 48 },
  //   { type: LlamaGrammarElementType.CHAR_RNG_UPPER, value: 57 },
  //   { type: LlamaGrammarElementType.CHAR_ALT, value: 95 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 10 },
  //   { type: LlamaGrammarElementType.ALT, value: 0 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.CHAR, value: 48 },
  //   { type: LlamaGrammarElementType.CHAR_RNG_UPPER, value: 57 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 11 },
  //   { type: LlamaGrammarElementType.ALT, value: 0 },
  //   { type: LlamaGrammarElementType.CHAR, value: 48 },
  //   { type: LlamaGrammarElementType.CHAR_RNG_UPPER, value: 57 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  //   { type: LlamaGrammarElementType.CHAR, value: 32 },
  //   { type: LlamaGrammarElementType.CHAR_ALT, value: 9 },
  //   { type: LlamaGrammarElementType.CHAR_ALT, value: 10 },
  //   { type: LlamaGrammarElementType.RULE_REF, value: 12 },
  //   { type: LlamaGrammarElementType.ALT, value: 0 },
  //   { type: LlamaGrammarElementType.END, value: 0 },
  // ];

  // index = 0;
  // for (const rule of parsedGrammar.rules) {
  //   for (let i = 0; i < rule.length; i++) {
  //     const element = rule[i];
  //     const expectedElement = expectedRulesLonger[index];

  //     if (expectedElement.type !== element.type || expectedElement.value !== element.value) {
  //       console.error(`index: ${index}`);
  //       console.error(`expected_element: ${expectedElement.type}, ${expectedElement.value}`);
  //       console.error(`actual_element: ${element.type}, ${element.value}`);
  //       console.error(`expected_element != actual_element`);
  //     }

  //     console.assert(expectedElement.type === element.type && expectedElement.value === element.value);
  //     index++;
  //   }
  // }

});
