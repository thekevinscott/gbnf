import GBNF, { RuleType } from '../../../packages/gbnf/src/index.js';

// (() => {
//   console.log('throw test')
//   const GrammarParser = GBNF(`root ::= "foo"`);
//   let thrown = false;
//   try {
//     const parser = new GrammarParser('foooooo');
//   } catch (err) {
//     thrown = true;
//   }
//   if (!thrown) {
//     console.error('Expected to throw on fooo');
//   }
// })();
// (() => {
//   console.log('optional range, ""')
//   const GrammarParser = GBNF(`root::=[a-z]?`);
//   const parser = new GrammarParser('');
//   console.log(parser.rules);
// })();
// (() => {
//   console.log('optional range, "a"')
//   const GrammarParser = GBNF(`root::=[a-z]?`);
//   const parser = new GrammarParser('a');
//   console.log(parser.rules);
//   if (parser.rules[0].type !== RuleType.END) {
//     console.error('Expected an ending rule type')
//   }
// })();

(() => {
  // [`root ::= [a-z]+`, 'az0',],
  console.log('range with +, "az"')
  const GrammarParser = GBNF(`root::=[a-z]+`);
  const parser = new GrammarParser('');
  console.log('rules:::::', JSON.stringify(parser.rules));
  parser.add('a')
  console.log('rules:::::', JSON.stringify(parser.rules));
  parser.add('z')
  console.log('rules:::::', JSON.stringify(parser.rules));
  // if (!parser.rules.map(r => r.type).includes(RuleType.RANGE)) {
  //   console.error('Expected a range rule type')
  // }
  // if (!parser.rules.map(r => r.type).includes(RuleType.END)) {
  //   console.error('Expected an ending rule type')
  // }
})();
