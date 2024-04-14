import GBNF, { Rule, Range, RuleType, } from 'gbnf';

const GrammarParser = GBNF('root ::= "foo"');
const grammar = new GrammarParser('fo');
grammar.add('o');
console.log(grammar.rules)
console.log(RuleType.ALT)
const r: Range = [1, 2];
console.log(r);
const r2w: Rule = { type: RuleType.CHAR, value: 1 };
console.log(r2w);
