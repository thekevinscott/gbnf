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
const state = GBNF(`
root  ::= "yes" | "no"
`)
```

If the grammar is invalid, `GBNF` will throw.

`GBNF` returns a state representing the parsed state:

```javascript
import GBNF from 'gbnf';
const state = GBNF(`
root  ::= "yes" | "no"
`)
for (const rule of state) {
  console.log(rule); 
  // { type: "CHAR", value: ["y".charCodeAt(0)]}
  // { type: "CHAR", value: ["n".charCodeAt(0)]}
}
```

`state` can be iterated over. (You can also call the iterator method directly with `state.rules()`). `state` cannot be indexed directly, but can easily be cast to an array with `[...state]` and indexed that way.

States are _immutable_. To parse a new token, call `state.add()`:

```javascript
import GBNF from 'gbnf';
let state = GBNF(`
root  ::= "I like green eggs and ham"
`)
console.log([...state]); // [{ type: "CHAR", value: ["I".charCodeAt(0)]}]
state = state.add("I li");
console.log([...state]); // [{ type: "CHAR", value: ["k".charCodeAt(0)]}]
state = state.add("ke gree");
console.log([...state]); // [{ type: "CHAR", value: ["n".charCodeAt(0)]}]
```

The possible rules returned include:

- `CHAR` - contains an array of either numbers representing code points to match, _or_ an array of two numbers denoting a range within which a code point may appear.
- `CHAR_EXCLUDED` - contains an array of numbers representing code points _not_ to match, _or_ an array of two numbers denoting a range within which a code point may _not_ appear.
- `END` - denotes a valid end of a string.
