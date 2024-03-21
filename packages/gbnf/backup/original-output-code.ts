class ParseState {
  rules: llama_grammar_element[][] = [];
  symbolIds: Map<string, number> = new Map();
}

interface llama_grammar_element {
  type: string;
  value: number;
}

const decode_utf8 = (src: string): [number, string] => {
  const lookup: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4];
  const first_byte: number = src.charCodeAt(0);
  const highbits: number = first_byte >> 4;
  const len: number = lookup[highbits];
  const mask: number = (1 << (8 - len)) - 1;
  let value: number = first_byte & mask;
  let end: number = len; // may overrun!
  let pos: number = 1;
  for (; pos < end && src[pos]; pos++) {
    value = (value << 6) + (src.charCodeAt(pos) & 0x3F);
  }
  return [value, src.substr(pos)];
}

const get_symbol_id = (state: ParseState, src: string, len: number): number => {
  const next_id: number = state.symbolIds.size;
  const result = state.symbolIds.set(src.substr(0, len), next_id);
  return result.get(src.substr(0, len))!;
}

const generate_symbol_id = (state: ParseState, base_name: string): number => {
  const next_id: number = state.symbolIds.size;
  state.symbolIds.set(base_name + '_' + next_id, next_id);
  return next_id;
}

const add_rule = (
  state: ParseState,
  rule_id: number,
  rule: llama_grammar_element[]
): void => {
  if (state.rules.length <= rule_id) {
    state.rules.length = rule_id + 1;
  }
  state.rules[rule_id] = rule;
}

const is_word_char = (c: string): boolean => {
  return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '-' || ('0' <= c && c <= '9');
}

const parse_hex = (src: string, size: number): [number, string] => {
  let pos: number = 0;
  let end: number = size;
  let value: number = 0;
  for (; pos < end && src[pos]; pos++) {
    value <<= 4;
    const c: string = src[pos];
    if ('a' <= c && c <= 'f') {
      value += c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    } else if ('A' <= c && c <= 'F') {
      value += c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    } else if ('0' <= c && c <= '9') {
      value += c.charCodeAt(0) - '0'.charCodeAt(0);
    } else {
      break;
    }
  }
  if (pos !== end) {
    throw new Error(`expecting ${size} hex chars at ${src}`);
  }
  return [value, src.substr(pos)];
}

const parse_space = (src: string, newline_ok: boolean): string => {
  let pos: number = 0;
  while (src[pos] === ' ' || src[pos] === '\t' || src[pos] === '#' ||
    (newline_ok && (src[pos] === '\r' || src[pos] === '\n'))) {
    if (src[pos] === '#') {
      while (src[pos] && src[pos] !== '\r' && src[pos] !== '\n') {
        pos++;
      }
    } else {
      pos++;
    }
  }
  return src.substr(pos);
}

const parse_name = (src: string): string => {
  let pos: number = 0;
  while (is_word_char(src[pos])) {
    pos++;
  }
  if (pos === 0) {
    throw new Error(`expecting name at ${src}`);
  }
  return src.substr(pos);
}

const parse_char = (src: string): [number, string] => {
  if (src[0] === '\\') {
    switch (src[1]) {
      case 'x': return parse_hex(src.substr(2), 2);
      case 'u': return parse_hex(src.substr(2), 4);
      case 'U': return parse_hex(src.substr(2), 8);
      case 't': return [0x09, src.substr(2)];
      case 'r': return [0x0D, src.substr(2)];
      case 'n': return [0x0A, src.substr(2)];
      case '\\':
      case '"':
      case '[':
      case ']':
        return [src.charCodeAt(1), src.substr(2)];
      default:
        throw new Error(`unknown escape at ${src}`);
    }
  } else if (src[0]) {
    return decode_utf8(src);
  }
  throw new Error("unexpected end of input");
}

const parse_alternates = (
  state: ParseState,
  src: string,
  rule_name: string,
  rule_id: number,
  is_nested: boolean
): string => {
  const rule: llama_grammar_element[] = [];
  let pos: string = parse_sequence(state, src, rule_name, rule, is_nested);
  while (src[pos] === '|') {
    rule.push({ type: 'ALT', value: 0 });
    pos = parse_space(src.substr(pos + 1), true);
    pos = parse_sequence(state, src.substr(pos), rule_name, rule, is_nested);
  }
  rule.push({ type: 'END', value: 0 });
  add_rule(state, rule_id, rule);
  return pos;
}

const parse_sequence = (
  state: ParseState,
  src: string,
  rule_name: string,
  out_elements: llama_grammar_element[],
  is_nested: boolean
): string => {
  let lastSymStart: number = out_elements.length;
  let pos: string = src;
  while (src[pos]) {
    if (src[pos] === '"') {
      pos++;
      lastSymStart = out_elements.length;
      while (src[pos] !== '"') {
        const [charValue, newPos] = parse_char(src.substr(pos));
        pos = newPos;
        out_elements.push({ type: 'CHAR', value: charValue });
      }
      pos = parse_space(src.substr(pos + 1), is_nested);
    } else if (src[pos] === '[') {
      pos++;
      let start_type: string = 'CHAR';
      if (src[pos] === '^') {
        pos++;
        start_type = 'CHAR_NOT';
      }
      lastSymStart = out_elements.length;
      while (src[pos] !== ']') {
        const [charValue, newPos] = parse_char(src.substr(pos));
        pos = newPos;
        const type: string = lastSymStart < out_elements.length ?
          'CHAR_ALT' : start_type;
        out_elements.push({ type: type, value: charValue });
        if (src[pos] === '-' && src[pos + 1] !== ']') {
          const [endcharValue, newPos] = parse_char(src.substr(pos + 1));
          pos = newPos;
          out_elements.push({ type: 'CHAR_RNG_UPPER', value: endcharValue });
        }
      }
      pos = parse_space(src.substr(pos + 1), is_nested);
    } else if (is_word_char(src[pos])) {
      const nameEnd: string = parse_name(src.substr(pos));
      const refRuleId: number = get_symbol_id(state, src.substr(pos), nameEnd.length);
      pos = parse_space(src.substr(nameEnd.length), is_nested);
      lastSymStart = out_elements.length;
      out_elements.push({ type: 'RULE_REF', value: refRuleId });
    } else if (src[pos] === '(') {
      pos = parse_space(src.substr(pos + 1), true);
      const subRuleId: number = generate_symbol_id(state, rule_name);
      pos = parse_alternates(state, src.substr(pos), rule_name, subRuleId, true);
      lastSymStart = out_elements.length;
      out_elements.push({ type: 'RULE_REF', value: subRuleId });
      if (src[pos] !== ')') {
        throw new Error(`expecting ')' at ${pos}`);
      }
      pos = parse_space(src.substr(pos + 1), is_nested);
    } else if (src[pos] === '*' || src[pos] === '+' || src[pos] === '?') {
      if (lastSymStart === out_elements.length) {
        throw new Error(`expecting preceding item to */+/? at ${pos}`);
      }
      const subRuleId: number = generate_symbol_id(state, rule_name);
      const subRule: llama_grammar_element[] = out_elements.slice(lastSymStart);
      if (src[pos] === '*' || src[pos] === '+') {
        subRule.push({ type: 'RULE_REF', value: subRuleId });
      }
      subRule.push({ type: 'ALT', value: 0 });
      if (src[pos] === '+') {
        subRule.push(...out_elements.slice(lastSymStart));
      }
      subRule.push({ type: 'END', value: 0 });
      add_rule(state, subRuleId, subRule);
      out_elements.splice(lastSymStart);
      out_elements.push({ type: 'RULE_REF', value: subRuleId });
      pos = parse_space(src.substr(pos + 1), is_nested);
    } else {
      break;
    }
  }
  return pos;
}

const parse_rule = (state: ParseState, src: string): string => {
  const nameEnd: string = parse_name(src);
  let pos: string = parse_space(src.substr(nameEnd.length), false);
  const ruleId: number = get_symbol_id(state, src.substr(0, nameEnd.length), nameEnd.length);
  const name: string = src.substr(0, nameEnd.length);

  if (!(src[pos] === ':' && src[pos + 1] === ':' && src[pos + 2] === '=')) {
    throw new Error(`expecting ::= at ${pos}`);
  }
  pos = parse_space(src.substr(pos + 3), true);

  pos = parse_alternates(state, src.substr(pos), name, ruleId, false);

  if (src[pos] === '\r') {
    pos += src[pos + 1] === '\n' ? 2 : 1;
  } else if (src[pos] === '\n') {
    pos++;
  } else if (src[pos]) {
    throw new Error(`expecting newline or end at ${pos}`);
  }
  return parse_space(src.substr(pos), true);
}

export const parse = (src: string): ParseState => {
  try {
    const state: ParseState = new ParseState();
    let pos: string = parse_space(src, true);
    while (src[pos]) {
      pos = parse_rule(state, src.substr(pos));
    }
    // Validate the state to ensure that all rules are defined
    for (const rule of state.rules) {
      for (const elem of rule) {
        if (elem.type === 'RULE_REF') {
          // Ensure that the rule at that location exists
          if (elem.value >= state.rules.length || state.rules[elem.value].length === 0) {
            // Get the name of the rule that is missing
            for (const [key, value] of state.symbolIds) {
              if (value === elem.value) {
                throw new Error(`Undefined rule identifier '${key}'`);
              }
            }
          }
        }
      }
    }
    return state;
  } catch (err) {
    console.error(`${err.name}: error parsing grammar: ${err.message}`);
    return new ParseState();
  }
}

