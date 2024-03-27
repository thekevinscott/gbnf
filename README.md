# GBNF

A library for parsing `.gbnf` grammar files.

## Install

```bash
npm install gbnf
```

## Usage

Pass your grammar to `GBNF`:

```javascript
import GBNF from 'gbnf';
const GrammarParser = GBNF(`
root  ::= "yes" | "no"
`)
```

If the grammar is invalid, `GBNF` will throw.

`GBNF` returns a parser class that can be instantiated with a starting string:

```javascript
const grammar = new GrammarParser('yes');
```

An invalid input string will throw:

```javascript
const grammar = new GrammarParser('maybe'); // this will throw
```

Subsequent input strings can be appended with `.add()`:

```javascript
import GBNF from 'gbnf';
const GrammarParser = GBNF(`
root  ::= "yes I like green eggs and ham" 
`)
const grammar = new GrammarParser('yes ');
grammar.add('I ');
grammar.add('like ');
```

At any point you can get the next rules with `.rules`:

```javascript
console.log(grammar.rules);
```

Rules [mimic the rules defined for grammar files in `llama.cpp`](https://github.com/ggerganov/llama.cpp/blob/master/llama.h#L295). The exception is `RANGE`, whose value is an array of pairs denoting ranges that can be matched.
