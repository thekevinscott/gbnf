// export type RulePointer = { stackPos: number; pathPos: number; rulePos: number; };

import { Rule, RuleRef, RuleType, isRuleRange, isRuleRef, isRuleWithNumericValue, } from "../types.js";

export interface Position {
  stackPos: number;
  pathPos: number;
  rulePos: number;
}

export class RulePointer {
  #stacks: Rule[][][];
  // during iteration, if we encounter reference rules, we make a note of it
  // and add to our list for the next iteration cycle
  #nextRules: RuleRef[] = [];
  prevPointers?: RulePointer[];

  paths = new Set<Position>();
  constructor(stacks: Rule[][][], stackPos: number, rulePos: number = 0, prevPointers?: RulePointer[]) {
    this.#stacks = stacks;
    // console.log(stacks);
    const stack = stacks[stackPos];

    for (let i = 0; i < stack.length; i++) {
      this.paths.add({
        stackPos,
        pathPos: i,
        rulePos,
      });
    }
    this.prevPointers = prevPointers;
  }

  getRule = ({ stackPos, pathPos, rulePos, }: Position): Rule => {
    const rule = this.#stacks[stackPos][pathPos][rulePos];
    if (rule === undefined) {
      throw new Error('Out of bounds rule');
    }
    return rule;
  };

  addReferenceRule = (rule: RuleRef) => {
    // console.log('add reference rule')
    // expand the reference rule
    const referenceRule = this.#stacks[rule.value];
    // console.log('add ref rule', referenceRule);
    for (let pathPos = 0; pathPos < referenceRule.length; pathPos++) {
      this.paths.add({
        stackPos: rule.value,
        pathPos,
        rulePos: 0,
      });
    }
  };

  *[Symbol.iterator](): IterableIterator<{ rule: Rule; position: Position; }> {
    // const seen = new Set<string>();
    // const getKey = (position: Position) => [position.stackPos, position.pathPos, position.rulePos,].join('-');
    for (const position of this.paths) {
      // const stringified = getKey(position);
      // const __rule = this.#stacks[position.stackPos][position.pathPos][position.rulePos];
      // console.log('start loop', Array.from(this.paths).map(getKey), stringified, JSON.stringify(__rule));
      // if (seen.has(stringified)) {
      //   throw new Error('We are in a loop');
      // }
      // seen.add(stringified);
      // console.log('position', position);
      const rule = this.getRule(position);
      if (isRuleRef(rule)) {
        // console.log('while iterating, we add a reference rule');
        this.delete(position);
        this.addReferenceRule(rule);
      } else {
        // console.log('yield!', JSON.stringify(rule), position);
        yield { rule, position, };
      }
    }

    while (this.#nextRules.length) {
      const nextRule = this.#nextRules.shift();
      this.addReferenceRule(nextRule);
    }
  };

  increment = (position: Position) => {
    const nextRule = this.getRule({
      stackPos: position.stackPos,
      pathPos: position.pathPos,
      rulePos: position.rulePos + 1,
    });
    if (isRuleRef(nextRule)) {
      // add this reference rule to our paths, for handling on the next iteration cyucle
      this.#nextRules.push(nextRule);
    } else {
      position.rulePos += 1;
    }
  };

  hasNextRule = ({ rulePos, stackPos, pathPos, }: Position): boolean => {
    return rulePos + 1 < this.#stacks[stackPos][pathPos].length;
  };

  delete = (position: Position) => {
    this.paths.delete(position);
  };

  get rules(): Rule[] {
    const rules = new Rules();
    for (const { rule, } of this) {
      rules.add(rule);
    }
    return rules.rules;
  }
}

export class RulePointers extends Array<RulePointer | RulePointers> {
  constructor(...pointers: (RulePointer | RulePointers)[]) {
    super(...pointers);
  }

  static get = (rulePointer: RulePointers, idx: number): RulePointer | RulePointers => {
    return rulePointer[idx];
  };
  static set = (rulePointer: RulePointers, idx: number, value: RulePointer | RulePointers): void => {
    rulePointer[idx] = value;
  };
  static del = (rulePointer: RulePointers, idx: number): RulePointers => {
    return rulePointer.filter((_, i) => i !== idx); // remove this rule
  };
  static getLen = (rulePointer: RulePointers): number => {
    return rulePointer.length;
  };

}


export class RulePointersBackup {
  #stacks: Rule[][][];
  #pointers: (RulePointer | RulePointersBackup)[];

  constructor(stacks: Rule[][][], stackPos: number, prevPointers: RulePointer[] = []) {
    this.#stacks = stacks;
    const stack = stacks[stackPos];
    this.#pointers = stack.map((_, pathPos) => {
      const rule = stack[pathPos][0];
      if (rule.type === RuleType.RULE_REF) {
        return new RulePointersBackup(stacks, rule.value, [...prevPointers, new RulePointer(stackPos, pathPos, 0, prevPointers),]);
        // return getRulePosition(stacks, rule.value, [...prevPointers, new RulePointer(stackPos, pathPos, 0, prevPointers),]);
      }
      return new RulePointer(stackPos, pathPos, 0, []);
    });
  }

  get length() {
    return this.#pointers.length;
  }

  get(idx: number): RulePointer | RulePointersBackup {
    return this.#pointers[idx];
  }

  delete(idx: number): void {
    this.#pointers = this.#pointers.filter((_, i) => i !== idx); // remove this rule
  }

  #fetchRules(rules = new Rules()): Rules {
    for (const pointer of this.#pointers) {
      if (pointer instanceof RulePointer) {
        const { stackPos, pathPos, rulePos, } = pointer;
        const rule = this.#stacks[stackPos][pathPos][rulePos];
        rules.add(rule);
      } else {
        pointer.#fetchRules(rules);
      }
    }
    return rules;
  }
  fetchRules(): Rule[] {
    return this.#fetchRules(new Rules()).rules;
  }
}

const getKey = (rule: Rule) => {
  if (isRuleRange(rule)) {
    return `${rule.type}-${JSON.stringify(rule.value)}`;
  }
  if (isRuleWithNumericValue(rule)) {
    return `${rule.type}-${rule.value}`;
  }
  return rule.type;
};

class Rules {
  seen = new Set<string>();
  rules: Rule[] = [];

  add = (rule: Rule) => {
    const key = getKey(rule);
    if (!this.seen.has(key)) {
      this.seen.add(key);
      this.rules.push(rule);
    }
  };
}

// export const fetchRules = (stacks: Rule[][][], rulePointer: RulePointers, rules = new Rules()): Rules => {
//   for (const pointer of rulePointer) {
//     if (Array.isArray(pointer)) {
//       fetchRules(stacks, pointer, rules);
//     } else {
//       const { stackPos, pathPos, rulePos, } = pointer;
//       const stack = stacks[stackPos];
//       const rule = stack[pathPos][rulePos];
//       rules.add(rule);
//     }
//   }
//   return rules;
// };
