import { Rule, RulePosition, RuleRef, isRuleRange, isRuleRef, isRuleWithNumericValue, } from "../types.js";

export class RulePointer {
  #stacks: Rule[][][];
  // during iteration, if we encounter reference rules, we make a note of it
  // and add to our list for the next iteration cycle
  #nextRuleAndPositions: { rule: Rule; position: RulePosition; }[] = [];

  #positions = new Set<RulePosition>();
  constructor(stacks: Rule[][][], stackPos: number, rulePos: number = 0) {
    this.#stacks = stacks;
    const stack = stacks[stackPos];

    for (let pathPos = 0; pathPos < stack.length; pathPos++) {
      this.addPosition(stackPos, pathPos, rulePos);
    }
  }

  getRule = ({ stackPos, pathPos, rulePos, }: Omit<RulePosition, 'previous'>): Rule => {
    const rule = this.#stacks[stackPos][pathPos][rulePos];
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
    const referenceRule = this.#stacks[rule.value];
    for (let pathPos = 0; pathPos < referenceRule.length; pathPos++) {
      this.addPosition(rule.value, pathPos, 0, position);
    }
  };

  *[Symbol.iterator](): IterableIterator<{ rule: Rule; position: RulePosition; }> {
    for (const position of this.#positions) {
      const rule = this.getRule(position);
      if (isRuleRef(rule)) {
        this.delete(position);
        this.addReferenceRule(rule, position);
      } else {
        yield { rule, position, };
      }
    }

    while (this.#nextRuleAndPositions.length) {
      const { rule: nextRule, position, } = this.#nextRuleAndPositions.shift();
      if (isRuleRef(nextRule)) {
        this.addReferenceRule(nextRule, position);
      } else {
        console.log('not hanlded yet');
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
    return rulePos + 1 < this.#stacks[stackPos][pathPos].length;
  };

  delete = (position: RulePosition, isEndingRule = false) => {
    this.#positions.delete(position);

    if (isEndingRule && position.previous) {
      console.log('ending rule');
    }
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
