enum LlamaGrammarType {
  END = "END",
  ALT = "ALT",
  RULE_REF = "RULE_REF",
  CHAR = "CHAR",
  CHAR_NOT = "CHAR_NOT",
  CHAR_RNG_UPPER = "CHAR_RNG_UPPER",
  CHAR_ALT = "CHAR_ALT"
}

interface LlamaGrammarElement {
  type: LlamaGrammarType;
  value: number;
}

export interface ParseState {
  symbolIds: Map<string, number>;
  rules: LlamaGrammarElement[][];
}

function decodeUtf8(src: string): [number, string] {
  const codePoint = src.codePointAt(0)!;
  if (codePoint >= 0x80) {
    throw new Error("Non-ASCII characters not supported");
  }
  return [codePoint, src.substring(1)];
}

function getSymbolId(state: ParseState, src: string, len: number): number {
  const nextId = state.symbolIds.size;
  const symbol = src.substring(0, len);
  if (!state.symbolIds.has(symbol)) {
    state.symbolIds.set(symbol, nextId);
  }
  return state.symbolIds.get(symbol)!;
}

function generateSymbolId(state: ParseState, baseName: string): number {
  const nextId = state.symbolIds.size;
  const symbol = `${baseName}_${nextId}`;
  state.symbolIds.set(symbol, nextId);
  return nextId;
}

function addRule(state: ParseState, ruleId: number, rule: LlamaGrammarElement[]): void {
  if (state.rules.length <= ruleId) {
    state.rules.length = ruleId + 1;
  }
  state.rules[ruleId] = rule;
}

function isWordChar(c: string): boolean {
  return /[a-zA-Z0-9-]/.test(c);
}

function parseHex(src: string, size: number): [number, string] {
  let value = 0;
  let pos = src;
  const end = src.substring(0, size);
  for (let i = 0; i < size; i++) {
    const c = end.charAt(i);
    let digit;
    if ('a' <= c && c <= 'f') {
      digit = c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    } else if ('A' <= c && c <= 'F') {
      digit = c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    } else if ('0' <= c && c <= '9') {
      digit = c.charCodeAt(0) - '0'.charCodeAt(0);
    } else {
      throw new Error(`Expecting ${size} hex chars at ${src}`);
    }
    value = (value << 4) + digit;
  }
  return [value, src.substring(size)];
}

function parseSpace(src: string, newlineOk: boolean): string {
  let pos = src;
  while (pos.charAt(0) === ' ' || pos.charAt(0) === '\t' || pos.charAt(0) === '#' ||
    (newlineOk && (pos.charAt(0) === '\r' || pos.charAt(0) === '\n'))) {
    if (pos.charAt(0) === '#') {
      while (pos.charAt(0) && pos.charAt(0) !== '\r' && pos.charAt(0) !== '\n') {
        pos = pos.substring(1);
      }
    } else {
      pos = pos.substring(1);
    }
  }
  return pos;
}

function parseName(src: string): string {
  let pos = src;
  while (isWordChar(pos.charAt(0))) {
    pos = pos.substring(1);
  }
  if (pos === src) {
    throw new Error(`Expecting name at ${src}`);
  }
  return pos;
}

function parseChar(src: string): [number, string] {
  if (src.charAt(0) === '\\') {
    switch (src.charAt(1)) {
      case 'x':
        return parseHex(src.substring(2), 2);
      case 'u':
        return parseHex(src.substring(2), 4);
      case 'U':
        return parseHex(src.substring(2), 8);
      case 't':
        return [9, src.substring(2)];
      case 'r':
        return [13, src.substring(2)];
      case 'n':
        return [10, src.substring(2)];
      case '\\':
      case '"':
      case '[':
      case ']':
        return [src.charCodeAt(1), src.substring(2)];
      default:
        throw new Error(`Unknown escape at ${src}`);
    }
  } else if (src.charAt(0)) {
    return decodeUtf8(src);
  }
  throw new Error("Unexpected end of input");
}

function parseSequence(
  state: ParseState,
  src: string,
  ruleName: string,
  outElements: LlamaGrammarElement[],
  isNested: boolean
): string {
  let lastSymStart = outElements.length;
  let pos = src;
  while (pos) {
    if (pos.charAt(0) === '"') { // literal string
      pos = pos.substring(1);
      lastSymStart = outElements.length;
      while (pos.charAt(0) !== '"') {
        const [charValue, newPos] = parseChar(pos);
        pos = newPos;
        outElements.push({ type: LlamaGrammarType.CHAR, value: charValue });
      }
      pos = parseSpace(pos.substring(1), isNested);
    } else if (pos.charAt(0) === '[') { // char range(s)
      pos = pos.substring(1);
      let startType = LlamaGrammarType.CHAR;
      if (pos.charAt(0) === '^') {
        pos = pos.substring(1);
        startType = LlamaGrammarType.CHAR_NOT;
      }
      lastSymStart = outElements.length;
      while (pos.charAt(0) !== ']') {
        const [charValue, newPos] = parseChar(pos);
        pos = newPos;
        let type = lastSymStart < outElements.length
          ? LlamaGrammarType.CHAR_ALT
          : startType;
        outElements.push({ type, value: charValue });
        if (pos.charAt(0) === '-' && pos.charAt(1) !== ']') {
          const [endCharValue, newNewPos] = parseChar(pos.substring(1));
          pos = newNewPos;
          outElements.push({ type: LlamaGrammarType.CHAR_RNG_UPPER, value: endCharValue });
        }
      }
      pos = parseSpace(pos.substring(1), isNested);
    } else if (isWordChar(pos.charAt(0))) { // rule reference
      const nameEnd = parseName(pos);
      const refRuleId = getSymbolId(state, pos, nameEnd.length);
      pos = parseSpace(nameEnd, isNested);
      lastSymStart = outElements.length;
      outElements.push({ type: LlamaGrammarType.RULE_REF, value: refRuleId });
    } else if (pos.charAt(0) === '(') { // grouping
      // parse nested alternates into synthesized rule
      pos = parseSpace(pos.substring(1), true);
      const subRuleId = generateSymbolId(state, ruleName);
      pos = parseAlternates(state, pos, ruleName, subRuleId, true);
      lastSymStart = outElements.length;
      // output reference to synthesized rule
      outElements.push({ type: LlamaGrammarType.RULE_REF, value: subRuleId });
      if (pos.charAt(0) !== ')') {
        throw new Error(`Expecting ')' at ${pos}`);
      }
      pos = parseSpace(pos.substring(1), isNested);
    } else if (pos.charAt(0) === '*' || pos.charAt(0) === '+' || pos.charAt(0) === '?') { // repetition operator
      if (lastSymStart === outElements.length) {
        throw new Error(`Expecting preceding item to */+/? at ${pos}`);
      }
      // apply transformation to previous symbol (lastSymStart to end) according to
      // rewrite rules:
      // S* --> S' ::= S S' |
      // S+ --> S' ::= S S' | S
      // S? --> S' ::= S |
      const subRuleId = generateSymbolId(state, ruleName);
      const subRule: LlamaGrammarElement[] = [];
      // add preceding symbol to generated rule
      subRule.push(...outElements.slice(lastSymStart));
      if (pos.charAt(0) === '*' || pos.charAt(0) === '+') {
        // cause generated rule to recurse
        subRule.push({ type: LlamaGrammarType.RULE_REF, value: subRuleId });
      }
      // mark start of alternate def
      subRule.push({ type: LlamaGrammarType.ALT, value: 0 });
      if (pos.charAt(0) === '+') {
        // add preceding symbol as alternate only for '+' (otherwise empty)
        subRule.push(...outElements.slice(lastSymStart));
      }
      subRule.push({ type: LlamaGrammarType.END, value: 0 });
      addRule(state, subRuleId, subRule);
      // in original rule, replace previous symbol with reference to generated rule
      outElements.splice(lastSymStart, outElements.length - lastSymStart,
        { type: LlamaGrammarType.RULE_REF, value: subRuleId });

      pos = parseSpace(pos.substring(1), isNested);
    } else {
      break;
    }
  }
  return pos;
}

function parseAlternates(
  state: ParseState,
  src: string,
  ruleName: string,
  ruleId: number,
  isNested: boolean
): string {
  const rule: LlamaGrammarElement[] = [];
  let pos = parseSequence(state, src, ruleName, rule, isNested);
  while (pos.charAt(0) === '|') {
    rule.push({ type: LlamaGrammarType.ALT, value: 0 });
    pos = parseSpace(pos.substring(1), true);
    pos = parseSequence(state, pos, ruleName, rule, isNested);
  }
  rule.push({ type: LlamaGrammarType.END, value: 0 });
  addRule(state, ruleId, rule);
  return pos;
}

function parseRule(state: ParseState, src: string): string {
  const nameEnd = parseName(src);
  let pos = parseSpace(nameEnd, false);
  const nameLen = nameEnd.length;
  const ruleId = getSymbolId(state, src, nameLen);
  const ruleName = src.substring(0, nameLen);
  if (pos.charAt(0) !== ':' || pos.charAt(1) !== ':' || pos.charAt(2) !== '=') {
    throw new Error(`Expecting ::= at ${pos}`);
  }
  pos = parseSpace(pos.substring(3), true);

  pos = parseAlternates(state, pos, ruleName, ruleId, false);

  if (pos.charAt(0) === '\r') {
    pos = pos.charAt(1) === '\n' ? pos.substring(2) : pos.substring(1);
  } else if (pos.charAt(0) === '\n') {
    pos = pos.substring(1);
  } else if (pos.charAt(0)) {
    throw new Error(`Expecting newline or end at ${pos}`);
  }
  return parseSpace(pos, true);

}

export function parse(src: string): ParseState {
  const state: ParseState = {
    symbolIds: new Map(),
    rules: []
  };
  let pos = parseSpace(src, true);
  while (pos) {
    pos = parseRule(state, pos);
  }
  // Validate the state to ensure that all rules are defined
  for (const rule of state.rules) {
    if (rule) {
      console.log('rule', rule)
      for (const elem of rule) {
        if (elem.type === LlamaGrammarType.RULE_REF) {
          // Ensure that the rule at that location exists
          if (elem.value >= state.rules.length || state.rules[elem.value]?.length === 0) {
            // Get the name of the rule that is missing
            for (const [symbol, id] of state.symbolIds) {
              if (id === elem.value) {
                throw new Error(`Undefined rule identifier '${symbol}'`);
              }
            }
          }
        }
      }
    }
  }
  return state;
}
