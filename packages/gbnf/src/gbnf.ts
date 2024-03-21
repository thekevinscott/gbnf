import { isWordChar } from "./is-word-char.js";
import { parseChar } from "./parse-char.js";
import { parseName } from "./parse-name.js";
import { parseSpace } from "./parse-space.js";
import { llama_grammar_element } from "./types.js";

export const GBNF = (grammar: string) => {
  const state = new GrammarParser(grammar);
  // if (state.rules.length === 0) {
  //   throw new Error(`Failed to parse grammar: ${grammar}`);
  // }
  // if (state.symbolIds.get('root') === undefined) {
  //   throw new Error("Grammar does not contain a 'root' symbol");
  // }
  // console.log('Rules:', state.rules);
  return state;
}

export class GrammarParser {
  private pos = 0;
  symbolIds: Map<string, number>;
  rules: any[];
  src: string;
  constructor(src: string) {
    this.symbolIds = new Map();
    this.rules = [];
    this.src = src;
    this.parse(src);
  }

  private parse = (src: string) => {
    this.pos = parseSpace(src, 0, true); // move cursor forward until we reach non-whitespace content

    // debugger;
    while (this.pos < src.length) {
      this.parseRule(src);
    }

    // Validate the state to ensure that all rules are defined
    for (const rule of this.rules) {
      for (const elem of rule) {
        if (elem.type === 'RULE_REF') {
          // Ensure that the rule at that location exists
          if (elem.value >= this.rules.length || this.rules[elem.value].length === 0) {
            // Get the name of the rule that is missing
            for (const [key, value] of this.symbolIds) {
              if (value === elem.value) {
                throw new Error(`Undefined rule identifier '${key}'`);
              }
            }
          }
        }
      }
    }
  }

  private parseRule = (src: string): void => {
    const name = parseName(src, this.pos);
    this.pos = parseSpace(src, this.pos + name.length, false);
    // console.log('name', name);
    const ruleId: number = this.getSymbolId(name, name.length);
    // console.log(`parseRule for name "${name}"`, src.slice(this.pos))

    // Skip over whitespace characters and find the ::= sequence
    this.pos = parseSpace(src, this.pos, true);
    // console.log('skipped over whitespace', src.slice(this.pos))
    if (!(src[this.pos] === ':' && src[this.pos + 1] === ':' && src[this.pos + 2] === '=')) {
      throw new Error(`Expecting ::= at ${this.pos}`);
    }
    // console.log('valid identifier')
    this.pos = parseSpace(src, this.pos + 3, true);
    // console.log('skiped over whitespace')

    this.parseAlternates(name, ruleId);
    // console.log('parsed alternates')

    if (src[this.pos] === '\r') {
      this.pos += src[this.pos + 1] === '\n' ? 2 : 1;
    } else if (src[this.pos] === '\n') {
      this.pos += 1;
    } else if (src[this.pos]) {
      throw new Error(`Expecting newline or end at ${this.pos}`);
    }
    this.pos = parseSpace(src, this.pos, true);
    // console.log('skiped over remaining whitespace')
  };

  getSymbolId = (src: string, len: number): number => {
    // const next_id: number = this.symbolIds.size;
    // const result = this.symbolIds.set(key, next_id);
    // return result.get(src.slice(0, len))!;
    const nextId = this.symbolIds.size;
    // console.log('src', src);
    const key = src.slice(0, len);
    if (!this.symbolIds.has(key)) {
      this.symbolIds.set(key, nextId);
    }
    return this.symbolIds.get(key);
  }

  generateSymbolId = (base_name: string): number => {
    const next_id: number = this.symbolIds.size;
    this.symbolIds.set(`${base_name}_${next_id}`, next_id);
    return next_id;
  }

  addRule = (
    rule_id: number,
    rule: llama_grammar_element[]
  ): void => {
    if (this.rules.length <= rule_id) {
      this.rules.length = rule_id + 1;
    }
    this.rules[rule_id] = rule;
  }


  parseSequence = (
    rule_name: string,
    out_elements: llama_grammar_element[],
    depth = 0,
  ): void => {
    const is_nested = depth !== 0;
    const src = this.src;
    let lastSymStart: number = out_elements.length;
    // console.log('parse sequence', src.slice(this.pos))
    while (src[this.pos]) {
      // this.pos = parseSpace(src, this.pos, is_nested);
      // console.log(src[this.pos])
      if (src[this.pos] === '"') {
        this.pos += 1;
        lastSymStart = out_elements.length;
        while (src[this.pos] !== '"') {
          // console.log('is not a quote')
          const charValue: number | [number, string] = parseChar(src.slice(this.pos), this.pos);
          // console.log('charValue', charValue)
          if (Array.isArray(charValue)) {
            out_elements.push({ type: 'CHAR', value: charValue[0] });
            this.pos += charValue[1].length; // Adjusting pos by the length of parsed characters
          } else {
            out_elements.push({ type: 'CHAR', value: charValue });
            this.pos += 1;
          }
        }
        this.pos = parseSpace(src, this.pos + 1, is_nested);
      } else if (src[this.pos] === '[') {
        // console.log('sq bracket')
        this.pos += 1;
        let start_type: string = 'CHAR';
        if (src[this.pos] === '^') {
          this.pos += 1;
          start_type = 'CHAR_NOT';
        }
        lastSymStart = out_elements.length;
        while (src[this.pos] !== ']') {
          const charValue: number | [number, string] = parseChar(src, this.pos);
          if (Array.isArray(charValue)) {
            out_elements.push({ type: 'CHAR', value: charValue[0] });
            this.pos += charValue[1].length; // Adjusting pos by the length of parsed characters
          } else {
            out_elements.push({ type: 'CHAR', value: charValue });
            this.pos += 1;
          }
          // const type: string = lastSymStart < out_elements.length ?
          //   'CHAR_ALT' : start_type;
          if (src[this.pos] === '-' && src[this.pos + 1] !== ']') {
            const endcharValue: number | [number, string] = parseChar(src, this.pos + 1);
            if (Array.isArray(endcharValue)) {
              out_elements.push({ type: 'CHAR_RNG_UPPER', value: endcharValue[0] });
              this.pos += endcharValue[1].length; // Adjusting pos by the length of parsed characters
            } else {
              out_elements.push({ type: 'CHAR_RNG_UPPER', value: endcharValue });
              this.pos += 1;
            }
          }
        }
        this.pos = parseSpace(src, this.pos + 1, is_nested);
      } else if (isWordChar(src[this.pos])) {
        const name = parseName(src, this.pos);
        // console.log(depth, 'word char', name)
        const refRuleId: number = this.getSymbolId(name, name.length);
        this.pos += name.length;
        this.pos = parseSpace(src, this.pos, is_nested);

        lastSymStart = out_elements.length;
        out_elements.push({ type: 'RULE_REF', value: refRuleId });
      } else if (src[this.pos] === '(') {
        // console.log(depth, 'open paren')
        this.pos = parseSpace(src, this.pos + 1, true);
        const subRuleId: number = this.generateSymbolId(rule_name);
        this.parseAlternates(rule_name, subRuleId, depth + 1);
        lastSymStart = out_elements.length;
        out_elements.push({ type: 'RULE_REF', value: subRuleId });
        // console.log('this pos', src.slice(this.pos))
        if (src[this.pos] !== ')') {
          throw new Error(`Expecting ')' at ${this.pos}`);
        }
        this.pos = parseSpace(src, this.pos + 1, is_nested);
      } else if (src[this.pos] === '*' || src[this.pos] === '+' || src[this.pos] === '?') {
        // console.log('star, +, ?')
        if (lastSymStart === out_elements.length) {
          throw new Error(`Expecting preceding item to */+/? at ${this.pos}`);
        }
        const subRuleId: number = this.generateSymbolId(rule_name);
        const subRule: llama_grammar_element[] = out_elements.slice(lastSymStart);
        if (src[this.pos] === '*' || src[this.pos] === '+') {
          subRule.push({ type: 'RULE_REF', value: subRuleId });
        }
        subRule.push({ type: 'ALT', value: 0 });
        if (src[this.pos] === '+') {
          subRule.push(...out_elements.slice(lastSymStart));
        }
        subRule.push({ type: 'END', value: 0 });
        this.addRule(subRuleId, subRule);
        out_elements.splice(lastSymStart);
        out_elements.push({ type: 'RULE_REF', value: subRuleId });
        this.pos = parseSpace(src, this.pos + 1, is_nested);
      } else {
        // console.log(`no matching if statement for character |${src[this.pos]}|`);
        break;
      }
    }
  };

  parseAlternates = (
    rule_name: string,
    rule_id: number,
    depth = 0,
  ): void => {
    const is_nested = depth !== 0;
    const src = this.src;
    const rule: llama_grammar_element[] = [];
    // console.log('parseAlternates', src.slice(this.pos))
    this.parseSequence(rule_name, rule, depth);
    while (src[this.pos] === '|') {
      rule.push({ type: 'ALT', value: 0 });
      this.pos = parseSpace(src, this.pos + 1, true);
      this.parseSequence(rule_name, rule, depth);
    }
    rule.push({ type: 'END', value: 0 });
    this.addRule(rule_id, rule);
    // console.log('all done parsing alternates')
  };
}
