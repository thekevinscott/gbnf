import { isWordChar } from "./is-word-char.js";
import { parseChar } from "./parse-char.js";
import { parseName } from "./parse-name.js";
import { parseSpace } from "./parse-space.js";
import { llama_grammar_element } from "./types.js";

export class GrammarParser {
  private pos = 0;
  symbolIds: Map<string, number>;
  rules: any[];
  constructor(src: string) {
    this.symbolIds = new Map();
    this.rules = [];
    this.pos = parseSpace(src, 0, true);
    while (src[this.pos]) {
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
  parseRule = (src: string): number => {
    const nameEnd = parseName(src, this.pos);
    this.pos = parseSpace(src, nameEnd, false);
    const ruleId: number = this.getSymbolId(src.slice(0, nameEnd), nameEnd);
    const name: string = src.slice(0, nameEnd);

    // Skip over whitespace characters and find the ::= sequence
    this.pos = parseSpace(src, nameEnd, true);
    if (!(src[this.pos] === ':' && src[this.pos + 1] === ':' && src[this.pos + 2] === '=')) {
      throw new Error(`Expecting ::= at ${this.pos}`);
    }
    this.pos = parseSpace(src, this.pos + 3, true);

    this.parseAlternates(src, name, ruleId, false);

    if (src[this.pos] === '\r') {
      this.pos += src[this.pos + 1] === '\n' ? 2 : 1;
    } else if (src[this.pos] === '\n') {
      this.pos++;
    } else if (src[this.pos]) {
      throw new Error(`Expecting newline or end at ${this.pos}`);
    }
    return parseSpace(src, this.pos, true);
  };
  getSymbolId = (src: string, len: number): number => {
    src = src.slice(this.pos);
    const next_id: number = this.symbolIds.size;
    const result = this.symbolIds.set(src.slice(0, len), next_id);
    return result.get(src.slice(0, len))!;
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
    src: string,
    rule_name: string,
    out_elements: llama_grammar_element[],
    is_nested: boolean,
  ): void => {
    let lastSymStart: number = out_elements.length;
    while (src[this.pos]) {
      if (src[this.pos] === '"') {
        this.pos++;
        lastSymStart = out_elements.length;
        while (src[this.pos] !== '"') {
          const charValue: number | [number, string] = parseChar(src, this.pos);
          if (Array.isArray(charValue)) {
            out_elements.push({ type: 'CHAR', value: charValue[0] });
            this.pos += charValue[1].length; // Adjusting pos by the length of parsed characters
          } else {
            out_elements.push({ type: 'CHAR', value: charValue });
            this.pos++;
          }
        }
        this.pos = parseSpace(src, this.pos, is_nested);
      } else if (src[this.pos] === '[') {
        this.pos++;
        let start_type: string = 'CHAR';
        if (src[this.pos] === '^') {
          this.pos++;
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
            this.pos++;
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
              this.pos++;
            }
          }
        }
        this.pos = parseSpace(src, this.pos, is_nested);
      } else if (isWordChar(src[this.pos])) {
        const namePos = parseName(src, this.pos);
        const refRuleId: number = this.getSymbolId(src, namePos);
        this.pos += namePos;
        lastSymStart = out_elements.length;
        out_elements.push({ type: 'RULE_REF', value: refRuleId });
      } else if (src[this.pos] === '(') {
        this.pos = parseSpace(src, this.pos + 1, true);
        const subRuleId: number = this.generateSymbolId(rule_name);
        this.parseAlternates(src, rule_name, subRuleId, true);
        lastSymStart = out_elements.length;
        out_elements.push({ type: 'RULE_REF', value: subRuleId });
        if (src[this.pos] !== ')') {
          throw new Error(`Expecting ')' at ${this.pos}`);
        }
        this.pos = parseSpace(src, this.pos, is_nested);
      } else if (src[this.pos] === '*' || src[this.pos] === '+' || src[this.pos] === '?') {
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
        this.pos = parseSpace(src, this.pos, is_nested);
      } else {
        break;
      }
    }
  };

  parseAlternates = (
    src: string,
    rule_name: string,
    rule_id: number,
    is_nested: boolean
  ): void => {
    const rule: llama_grammar_element[] = [];
    this.parseSequence(src, rule_name, rule, is_nested);
    while (src[this.pos] === '|') {
      rule.push({ type: 'ALT', value: 0 });
      this.pos = parseSpace(src, this.pos + 1, true);
      this.parseSequence(src, rule_name, rule, is_nested);
    }
    rule.push({ type: 'END', value: 0 });
    this.addRule(rule_id, rule);
  };
}

