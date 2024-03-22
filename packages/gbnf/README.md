# GBNF

A library for parsing `.gbnf` grammar files.

## Install

```bash
npm install gbnf
```

## Usage

```javascript
import GBNF from 'gbnf';
const grammar = GBNF(`
root  ::= "yes" | "no"
`)
```
