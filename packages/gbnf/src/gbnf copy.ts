export const GBNF = (grammar: string) => {
  const state: ParseState = parse(grammar);
  if (state.rules.length === 0) {
    throw new Error(`Failed to parse grammar: ${grammar}`);
  }
  if (state.symbolIds.get('root') === undefined) {
    throw new Error("Grammar does not contain a 'root' symbol");
  }
  console.log('Rules:', state.rules);
}

export class ParseState {
  rules: llama_grammar_element[][] = [];
  symbolIds: Map<string, number> = new Map();
  private pos = 0;

  constructor(src: string) {
    this.parse_space(src, true);
    while (src[this.pos]) {
      this.pos = this.parse_rule(src);
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
  }

  parse_space = (src: string, newline_ok: boolean): void => {
    while (src[this.pos] === ' ' || src[this.pos] === '\t' || src[this.pos] === '#' ||
      (newline_ok && (src[this.pos] === '\r' || src[this.pos] === '\n'))) {
      if (src[this.pos] === '#') {
        while (src[this.pos] && src[this.pos] !== '\r' && src[this.pos] !== '\n') {
          this.pos++;
        }
      } else {
        this.pos++;
      }
    }
  }

// decode_utf8 = (src: string): [number, string] => {
//   const lookup: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4];
//   const first_byte: number = src.charCodeAt(0);
//   const highbits: number = first_byte >> 4;
//   const len: number = lookup[highbits];
//   const mask: number = (1 << (8 - len)) - 1;
//   let value: number = first_byte & mask;
//   let end: number = len; // may overrun!
//   let pos: number = 1;
//   for (; pos < end && src[pos]; pos++) {
//     value = (value << 6) + (src.charCodeAt(pos) & 0x3F);
//   }
//   return [value, src.slice(pos)];
// }

// get_symbol_id = (src: string, len: number): number => {
//   const next_id: number = this.symbolIds.size;
//   const result = this.symbolIds.set(src.slice(0, len), next_id);
//   return result.get(src.slice(0, len))!;
// }

// generate_symbol_id = (state: ParseState, base_name: string): number => {
//   const next_id: number = state.symbolIds.size;
//   state.symbolIds.set(`${base_name}_${next_id}`, next_id);
//   return next_id;
// }

// add_rule = (
//   state: ParseState,
//   rule_id: number,
//   rule: llama_grammar_element[]
// ): void => {
//   if (state.rules.length <= rule_id) {
//     state.rules.length = rule_id + 1;
//   }
//   state.rules[rule_id] = rule;
// }

// parse_hex = (src: string, size: number): [number, string] => {
//   let pos: number = 0;
//   let end: number = size;
//   let value: number = 0;
//   for (; pos < end && src[pos]; pos++) {
//     value <<= 4;
//     const char: string = src[pos];
//     if ('a' <= char && char <= 'f') {
//       value += char.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
//     } else if ('A' <= char && char <= 'F') {
//       value += char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
//     } else if ('0' <= char && char <= '9') {
//       value += char.charCodeAt(0) - '0'.charCodeAt(0);
//     } else {
//       break;
//     }
//   }
//   if (pos !== end) {
//     throw new Error(`Expecting ${size} hex chars at ${src}`);
//   }
//   return [value, src.slice(pos)];
// }

// parse_name = (src: string): string => {
//   let pos: number = 0;
//   // Skip over whitespace characters
//   while (src[pos] === ' ' || src[pos] === '\t' || src[pos] === '\n') {
//     pos++;
//   }
//   // Find the rule name
//   while (is_word_char(src[pos])) {
//     pos++;
//   }
//   if (pos === 0) {
//     throw new Error(`Expecting name at ${src}`);
//   }
//   return src.slice(0, pos);
// }


// parse_alternates = (
//   state: ParseState,
//   src: string,
//   rule_name: string,
//   rule_id: number,
//   is_nested: boolean
// ): number => {
//   const rule: llama_grammar_element[] = [];
//   let pos: number = parse_sequence(state, src, rule_name, rule, is_nested);
//   while (src[pos] === '|') {
//     rule.push({ type: 'ALT', value: 0 });
//     pos = parse_space(src.slice(pos + 1), true).length;
//     pos = parse_sequence(state, src.slice(pos), rule_name, rule, is_nested);
//   }
//   rule.push({ type: 'END', value: 0 });
//   add_rule(state, rule_id, rule);
//   return pos;
// };


// parse_rule = (src: string): number => {
//   const nameEnd: string = this.parse_name(src);
//   this.parse_space(src.slice(nameEnd.length), false);
//   const ruleId: number = get_symbol_id(src.slice(0, nameEnd.length), nameEnd.length);
//   const name: string = src.slice(0, nameEnd.length);

//   // Skip over whitespace characters and find the ::= sequence
//   pos = parse_space(src.slice(nameEnd.length), true).length;
//   if (!(src[pos] === ':' && src[pos + 1] === ':' && src[pos + 2] === '=')) {
//     throw new Error(`Expecting ::= at ${pos}`);
//   }
//   pos = parse_space(src.slice(pos + 3), true).length;

//   pos = parse_alternates(state, src.slice(pos), name, ruleId, false);

//   if (src[pos] === '\r') {
//     pos += src[pos + 1] === '\n' ? 2 : 1;
//   } else if (src[pos] === '\n') {
//     pos++;
//   } else if (src[pos]) {
//     throw new Error(`Expecting newline or end at ${pos}`);
//   }
//   return parse_space(src.slice(pos), true).length;
// };

// parse_char = (src: string): [number, string] | number => {
//   if (src[0] === '\\') {
//     switch (src[1]) {
//       case 'x': return parse_hex(src.slice(2), 2);
//       case 'u': return parse_hex(src.slice(2), 4);
//       case 'U': return parse_hex(src.slice(2), 8);
//       case 't': return 0x09;
//       case 'r': return 0x0D;
//       case 'n': return 0x0A;
//       case '\\':
//       case '"':
//       case '[':
//       case ']':
//         return src.charCodeAt(1);
//       default:
//         throw new Error(`Unknown escape at ${src}`);
//     }
//   } else if (src[0]) {
//     return decode_utf8(src)[0];
//   }
//   throw new Error("Unexpected end of input");
// };

// parse_sequence = (
//   state: ParseState,
//   src: string,
//   rule_name: string,
//   out_elements: llama_grammar_element[],
//   is_nested: boolean
// ): number => {
//   let lastSymStart: number = out_elements.length;
//   let pos: number = 0;
//   while (src[pos]) {
//     if (src[pos] === '"') {
//       pos++;
//       lastSymStart = out_elements.length;
//       while (src[pos] !== '"') {
//         const charValue: number | [number, string] = parse_char(src.slice(pos));
//         if (Array.isArray(charValue)) {
//           out_elements.push({ type: 'CHAR', value: charValue[0] });
//           pos += charValue[1].length; // Adjusting pos by the length of parsed characters
//         } else {
//           out_elements.push({ type: 'CHAR', value: charValue });
//           pos++;
//         }
//       }
//       pos = parse_space(src.slice(pos), is_nested).length;
//     } else if (src[pos] === '[') {
//       pos++;
//       let start_type: string = 'CHAR';
//       if (src[pos] === '^') {
//         pos++;
//         start_type = 'CHAR_NOT';
//       }
//       lastSymStart = out_elements.length;
//       while (src[pos] !== ']') {
//         const charValue: number | [number, string] = parse_char(src.slice(pos));
//         if (Array.isArray(charValue)) {
//           out_elements.push({ type: 'CHAR', value: charValue[0] });
//           pos += charValue[1].length; // Adjusting pos by the length of parsed characters
//         } else {
//           out_elements.push({ type: 'CHAR', value: charValue });
//           pos++;
//         }
//         const type: string = lastSymStart < out_elements.length ?
//           'CHAR_ALT' : start_type;
//         if (src[pos] === '-' && src[pos + 1] !== ']') {
//           const endcharValue: number | [number, string] = parse_char(src.slice(pos + 1));
//           if (Array.isArray(endcharValue)) {
//             out_elements.push({ type: 'CHAR_RNG_UPPER', value: endcharValue[0] });
//             pos += endcharValue[1].length; // Adjusting pos by the length of parsed characters
//           } else {
//             out_elements.push({ type: 'CHAR_RNG_UPPER', value: endcharValue });
//             pos++;
//           }
//         }
//       }
//       pos = parse_space(src.slice(pos), is_nested).length;
//     } else if (is_word_char(src[pos])) {
//       const nameEnd: string = parse_name(src.slice(pos));
//       const refRuleId: number = this.get_symbol_id(state, src.slice(pos), nameEnd.length);
//       pos += nameEnd.length;
//       lastSymStart = out_elements.length;
//       out_elements.push({ type: 'RULE_REF', value: refRuleId });
//     } else if (src[pos] === '(') {
//       pos = parse_space(src.slice(pos + 1), true).length;
//       const subRuleId: number = generate_symbol_id(state, rule_name);
//       pos = parse_alternates(state, src.slice(pos), rule_name, subRuleId, true);
//       lastSymStart = out_elements.length;
//       out_elements.push({ type: 'RULE_REF', value: subRuleId });
//       if (src[pos] !== ')') {
//         throw new Error(`Expecting ')' at ${pos}`);
//       }
//       pos = parse_space(src.slice(pos), is_nested).length;
//     } else if (src[pos] === '*' || src[pos] === '+' || src[pos] === '?') {
//       if (lastSymStart === out_elements.length) {
//         throw new Error(`Expecting preceding item to */+/? at ${pos}`);
//       }
//       const subRuleId: number = generate_symbol_id(state, rule_name);
//       const subRule: llama_grammar_element[] = out_elements.slice(lastSymStart);
//       if (src[pos] === '*' || src[pos] === '+') {
//         subRule.push({ type: 'RULE_REF', value: subRuleId });
//       }
//       subRule.push({ type: 'ALT', value: 0 });
//       if (src[pos] === '+') {
//         subRule.push(...out_elements.slice(lastSymStart));
//       }
//       subRule.push({ type: 'END', value: 0 });
//       add_rule(state, subRuleId, subRule);
//       out_elements.splice(lastSymStart);
//       out_elements.push({ type: 'RULE_REF', value: subRuleId });
//       pos = parse_space(src.slice(pos), is_nested).length;
//     } else {
//       break;
//     }
//   }
//   return pos;
// };
// }

// export interface llama_grammar_element {
//   type: string;
//   value: number;
// }

// const is_word_char = (c: string): boolean => {
//   return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '-' || ('0' <= c && c <= '9');
// }
