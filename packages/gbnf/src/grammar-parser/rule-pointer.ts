import { Rule, RulePosition, RuleRef, isRuleEnd, isRuleRange, isRuleRef, isRuleWithNumericValue, } from "../types.js";

class Stacks {
  #rules = new Map<number, Rule>();
  #stacks: number[][][];

  constructor(stacks: Rule[][][]) {
    const keys = new Map<string, number>();
    this.#stacks = stacks.map(stack => {
      return stack.map(path => {
        return path.map(rule => {
          const key = getKey(rule);
          let id = keys.get(key);
          if (id === undefined) {
            id = keys.size;
            keys.set(key, id);
          }
          this.#rules.set(id, rule);
          return id;
        });
      });
    });
  }

  getStackSize(stackIdx: number): number {
    return this.#stacks[stackIdx].length;
  }

  getPathSize(stackPos: number, pathPos: number): number {
    return this.#stacks[stackPos][pathPos].length;
  }

  getRule(stackPos: number, pathPos: number, rulePos: number): Rule {
    const id = this.#stacks[stackPos][pathPos][rulePos];
    if (id === undefined) {
      throw new Error('Out of bounds rule');
    }
    return this.#rules.get(id);
  }
}

export class RulePointer {
  #stacks: Stacks;
  // during iteration, if we encounter reference rules, we make a note of it
  // and add to our list for the next iteration cycle
  #nextRuleAndPositions: { rule: Rule; position: RulePosition; }[] = [];

  #positions = new Set<RulePosition>();
  constructor(stacks: Rule[][][], stackPos: number, rulePos: number = 0) {
    this.#stacks = new Stacks(stacks);
    for (let pathPos = 0; pathPos < this.#stacks.getStackSize(stackPos); pathPos++) {
      this.addPosition(stackPos, pathPos, rulePos);
    }
  }

  getRule = ({ stackPos, pathPos, rulePos, }: Omit<RulePosition, 'previous'>): Rule => {
    const rule = this.#stacks.getRule(stackPos, pathPos, rulePos);
    if (rule === undefined) {
      throw new Error('Out of bounds rule');
    }
    return rule;
  };

  addPosition = (stackPos: number, pathPos: number, rulePos: number, previous?: RulePosition) => {
    this.#positions.add({
      stackPos,
      pathPos,
      rulePos,
      previous,
    });
  };

  addReferenceRule = (rule: RuleRef, position: RulePosition) => {
    for (let pathPos = 0; pathPos < this.#stacks.getStackSize(rule.value); pathPos++) {
      this.addPosition(rule.value, pathPos, 0, position);
    }
  };

  *[Symbol.iterator](): IterableIterator<{ rule: Rule; position: RulePosition; }> {
    for (const position of this.#positions) {
      const rule = this.getRule(position);
      if (isRuleRef(rule)) {
        this.delete(position);
        this.addReferenceRule(rule, position);
      } else if (isRuleEnd(rule)) {
        if (position.previous) {
          this.delete(position);
          this.addPosition(position.previous.stackPos, position.previous.pathPos, position.previous.rulePos + 1, position.previous.previous);
        } else {
          yield { rule, position, };
        }
      } else {
        yield { rule, position, };
      }
    }

    while (this.#nextRuleAndPositions.length) {
      const { rule: nextRule, position, } = this.#nextRuleAndPositions.shift();
      if (isRuleRef(nextRule)) {
        this.addReferenceRule(nextRule, position);
      } else {
        throw new Error('not hanlded yet');
      }
    }
  };

  increment = (position: RulePosition) => {
    const nextRule = this.getRule({
      ...position,
      rulePos: position.rulePos + 1,
    });
    if (isRuleRef(nextRule)) {
      // add this reference rule to our paths, for handling on the next iteration cyucle
      this.#nextRuleAndPositions.push({ rule: nextRule, position, });
    } else {
      position.rulePos += 1;
    }
  };

  hasNextRule = ({ rulePos, stackPos, pathPos, }: RulePosition): boolean => {
    return rulePos + 1 < this.#stacks.getPathSize(stackPos, pathPos);
  };

  delete = (position: RulePosition) => {
    this.#positions.delete(position);
  };

  get rules(): Rule[] {
    const rules = new Rules();
    for (const { rule, } of this) {
      rules.add(rule);
    }
    return rules.rules;
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
