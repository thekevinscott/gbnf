// import './antlr';
import { JSON_GRAMMAR, CHESS_GRAMMAR, ARITHMETIC_GRAMMAR } from './grammars.js';
import GBNF from '../../../packages/gbnf/src/index.js';
const grammarBytes: string = `root  ::= (expr "=" term "\n")+
expr  ::= term ([-+*/] term)*
term  ::= [0-9]+`;
const grammar = GBNF(grammarBytes)
console.log(grammar);
