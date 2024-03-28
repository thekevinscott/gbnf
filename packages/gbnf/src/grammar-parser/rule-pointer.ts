import { Rule, RulePosition, RuleRef, isRuleRange, isRuleRef, isRuleWithNumericValue, } from "../types.js";

export class RulePointer {
  #stacks: Rule[][][];
  // during iteration, if we encounter reference rules, we make a note of it
  // and add to our list for the next iteration cycle
  #nextRules: RuleRef[] = [];
  prevPointers?: RulePointer[];

  paths = new Set<RulePosition>();
  constructor(stacks: Rule[][][], stackPos: number, rulePos: number = 0, prevPointers?: RulePointer[]) {
    this.#stacks = stacks;
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

  getRule = ({ stackPos, pathPos, rulePos, }: RulePosition): Rule => {
    const rule = this.#stacks[stackPos][pathPos][rulePos];
    if (rule === undefined) {
      throw new Error('Out of bounds rule');
    }
    return rule;
  };

  addReferenceRule = (rule: RuleRef) => {
    const referenceRule = this.#stacks[rule.value];
    for (let pathPos = 0; pathPos < referenceRule.length; pathPos++) {
      this.paths.add({
        stackPos: rule.value,
        pathPos,
        rulePos: 0,
      });
    }
  };

  *[Symbol.iterator](): IterableIterator<{ rule: Rule; position: RulePosition; }> {
    for (const position of this.paths) {
      const rule = this.getRule(position);
      if (isRuleRef(rule)) {
        this.delete(position);
        this.addReferenceRule(rule);
      } else {
        yield { rule, position, };
      }
    }

    while (this.#nextRules.length) {
      const nextRule = this.#nextRules.shift();
      this.addReferenceRule(nextRule);
    }
  };

  increment = (position: RulePosition) => {
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

  hasNextRule = ({ rulePos, stackPos, pathPos, }: RulePosition): boolean => {
    return rulePos + 1 < this.#stacks[stackPos][pathPos].length;
  };

  delete = (position: RulePosition) => {
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
