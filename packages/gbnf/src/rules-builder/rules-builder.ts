import { isWordChar, } from "./is-word-char.js";
import { parseChar, } from "./parse-char.js";
import { parseName, } from "./parse-name.js";
import { parseSpace, } from "./parse-space.js";
import { RuleType, Rule, SymbolIds, } from "../types.js";

export class RulesBuilder {
  private pos = 0;
  symbolIds: SymbolIds;
  rules: Rule[][];
  src: string;
  start: number = performance.now();
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
        if (elem.type === RuleType.RULE_REF) {
          // Ensure that the rule at that location exists
          if (elem.value >= this.rules.length || this.rules[elem.value].length === 0) {
            // Get the name of the rule that is missing
            for (const [key, value,] of this.symbolIds) {
              if (value === elem.value) {
                throw new Error(`Undefined rule identifier '${key}'`);
              }
            }
          }
        }
      }
    }
  };

  private parseRule = (src: string): void => {
    const name = parseName(src, this.pos);
    this.pos = parseSpace(src, this.pos + name.length, false);
    const ruleId: number = this.getSymbolId(name, name.length);

    // Skip over whitespace characters and find the ::= sequence
    this.pos = parseSpace(src, this.pos, true);
    if (!(src[this.pos] === ':' && src[this.pos + 1] === ':' && src[this.pos + 2] === '=')) {
      throw new Error(`Expecting ::= at ${this.pos}`);
    }
    this.pos = parseSpace(src, this.pos + 3, true);

    this.parseAlternates(name, ruleId);

    if (src[this.pos] === '\r') {
      this.pos += src[this.pos + 1] === '\n' ? 2 : 1;
    } else if (src[this.pos] === '\n') {
      this.pos += 1;
    } else if (src[this.pos]) {
      throw new Error(`Expecting newline or end at ${this.pos}`);
    }
    this.pos = parseSpace(src, this.pos, true);
  };

  getSymbolId = (src: string, len: number): number => {
    const nextId = this.symbolIds.size;
    const key = src.slice(0, len);
    if (!this.symbolIds.has(key)) {
      this.symbolIds.set(key, nextId);
    }
    return this.symbolIds.get(key);
  };

  generateSymbolId = (base_name: string): number => {
    const next_id = this.symbolIds.size;
    this.symbolIds.set(`${base_name}_${next_id}`, next_id);
    return next_id;
  };

  addRule = (
    rule_id: number,
    rule: Rule[]
  ): void => {
    this.rules[rule_id] = rule;
  };


  parseSequence = (
    rule_name: string,
    outElements: Rule[],
    depth = 0,
  ): void => {
    const is_nested = depth !== 0;
    const src = this.src;
    let lastSymStart: number = outElements.length;
    while (src[this.pos]) {
      if (performance.now() - this.start > 50) {
        throw new Error('Too long');
      }
      if (src[this.pos] === '"') {
        // console.log('start quote', src.slice(this.pos))
        this.pos += 1;
        lastSymStart = outElements.length;
        while (src[this.pos] !== '"') {
          if (performance.now() - this.start > 50) {
            throw new Error('Too long');
          }
          const [value, incPos,] = parseChar(src, this.pos);
          // console.log('char', value, incPos);
          // if (Array.isArray(charValue)) {
          outElements.push({ type: RuleType.CHAR, value: [value,], });
          this.pos += incPos; // Adjusting pos by the length of parsed characters
          // } else {
          //   outElements.push({ type: RuleType.CHAR, value: charValue, });
          //   this.pos += 1;
          // }
        }
        // console.log('end quote', src.slice(this.pos))
        this.pos = parseSpace(src, this.pos + 1, is_nested);
      } else if (src[this.pos] === '[') {
        this.pos += 1;
        let startType: RuleType = RuleType.CHAR;
        if (src[this.pos] === '^') {
          this.pos += 1;
          startType = RuleType.CHAR_NOT;
        }
        lastSymStart = outElements.length;
        while (src[this.pos] !== ']') {
          if (performance.now() - this.start > 50) {
            throw new Error('Too long');
          }
          const type = lastSymStart < outElements.length ? RuleType.CHAR_ALT : startType;
          const [startcharValue, incPos,] = parseChar(src, this.pos);
          this.pos += incPos;
          // console.log('push it!', type, startcharValue, String.fromCharCode(startcharValue));
          if (type === RuleType.CHAR) {
            outElements.push({ type, value: [startcharValue,], });
          } else {
            outElements.push({ type, value: startcharValue, });
          }

          if (src[this.pos] === '-' && src[this.pos + 1] !== ']') {
            this.pos += 1;
            const [endcharValue, incPos,] = parseChar(src, this.pos);
            outElements.push({ type: RuleType.CHAR_RNG_UPPER, value: endcharValue, });
            this.pos += incPos;
          }
        }
        this.pos = parseSpace(src, this.pos + 1, is_nested);
      } else if (isWordChar(src[this.pos])) {
        const name = parseName(src, this.pos);
        const refRuleId: number = this.getSymbolId(name, name.length);
        this.pos += name.length;
        this.pos = parseSpace(src, this.pos, is_nested);

        lastSymStart = outElements.length;
        outElements.push({ type: RuleType.RULE_REF, value: refRuleId, });
      } else if (src[this.pos] === '(') {
        this.pos = parseSpace(src, this.pos + 1, true);
        const subRuleId: number = this.generateSymbolId(rule_name);
        // console.log('src', src.slice(this.pos));
        this.parseAlternates(rule_name, subRuleId, depth + 1);
        lastSymStart = outElements.length;
        outElements.push({ type: RuleType.RULE_REF, value: subRuleId, });
        if (src[this.pos] !== ')') {
          throw new Error(`Expecting ')' at ${this.pos}`);
        }
        this.pos = parseSpace(src, this.pos + 1, is_nested);
      } else if (src[this.pos] === '*' || src[this.pos] === '+' || src[this.pos] === '?') {
        if (lastSymStart === outElements.length) {
          throw new Error(`Expecting preceding item to */+/? at ${this.pos}`);
        }
        const subRuleId: number = this.generateSymbolId(rule_name);
        const subRule: Rule[] = outElements.slice(lastSymStart);
        if (src[this.pos] === '*' || src[this.pos] === '+') {
          subRule.push({ type: RuleType.RULE_REF, value: subRuleId, });
        }
        subRule.push({ type: RuleType.ALT, });
        if (src[this.pos] === '+') {
          subRule.push(...outElements.slice(lastSymStart));
        }
        subRule.push({ type: RuleType.END, });
        this.addRule(subRuleId, subRule);
        outElements.splice(lastSymStart);
        outElements.push({ type: RuleType.RULE_REF, value: subRuleId, });
        this.pos = parseSpace(src, this.pos + 1, is_nested);
      } else {
        break;
      }
    }
  };

  parseAlternates = (
    rule_name: string,
    rule_id: number,
    depth = 0,
  ): void => {
    const src = this.src;
    const rule: Rule[] = [];
    this.parseSequence(rule_name, rule, depth);
    while (src[this.pos] === '|') {
      if (performance.now() - this.start > 50) {
        throw new Error('Too long');
      }
      rule.push({ type: RuleType.ALT, });
      this.pos = parseSpace(src, this.pos + 1, true);
      this.parseSequence(rule_name, rule, depth);
    }
    rule.push({ type: RuleType.END, });
    this.addRule(rule_id, rule);
  };
}

