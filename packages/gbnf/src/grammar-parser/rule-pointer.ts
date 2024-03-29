import { Rule, RulePosition, RuleRef, isRuleEnd, isRuleRange, isRuleRef, isRuleWithNumericValue, } from "../types.js";

type RuleId = number;
class Stacks {
  #rules = new Map<RuleId, Rule>();
  #stacks: RuleId[][][];

  constructor(stacks: Rule[][][]) {
    const keys = new Map<string, RuleId>();
    this.#stacks = stacks.map(stack => stack.map(path => path.map(rule => {
      const key = getKey(rule);
      let id = keys.get(key);
      if (id === undefined) {
        id = keys.size;
        keys.set(key, id);
      }
      this.#rules.set(id, rule);
      return id;
    })));
  }

  getStackSize = (stackIdx: number): number => this.#stacks[stackIdx].length;

  getPathSize = (stackPos: number, pathPos: number): number => this.#stacks[stackPos][pathPos].length;

  getRule = ({ stackPos, pathPos, rulePos, }: Omit<RulePosition, 'previous'>): {
    ruleId: RuleId;
    rule: Rule;
  } => {
    const ruleId = this.#stacks[stackPos][pathPos][rulePos];
    if (ruleId === undefined) {
      throw new Error('Out of bounds rule');
    }
    return {
      ruleId,
      rule: this.#rules.get(ruleId),
    };
  };
}

class Positions {
  #positions = new Set<RulePosition>();
  #stacks: Stacks;

  constructor(stacks: Stacks) {
    this.#stacks = stacks;
  }

  add = (position: RulePosition) => {
    // const { rule, ruleId } = this.#stacks.getRule(position);
    this.#positions.add(position);
  };

  delete = (position: RulePosition) => {
    this.#positions.delete(position);
  };

  *[Symbol.iterator](): IterableIterator<RulePosition> {
    for (const position of this.#positions) {
      yield position;
    }
  };
}

export class RulePointer {
  #stacks: Stacks;
  // during iteration, if we encounter reference rules, we make a note of it
  // and add to our list for the next iteration cycle
  #nextRuleAndPositions: { rule: Rule; position: RulePosition; }[] = [];

  #positions: Positions;
  constructor(stacks: Rule[][][], stackPos: number, rulePos: number = 0) {
    this.#stacks = new Stacks(stacks);
    this.#positions = new Positions(this.#stacks);
    for (let pathPos = 0; pathPos < this.#stacks.getStackSize(stackPos); pathPos++) {
      this.addPosition(stackPos, pathPos, rulePos);
    }
  }

  getRule = (position: Omit<RulePosition, 'previous'>) => this.#stacks.getRule(position);

  addPosition = (stackPos: number, pathPos: number, rulePos: number, previous?: RulePosition[]) => {
    this.#positions.add({
      stackPos,
      pathPos,
      rulePos,
      previous,
    });
  };

  addReferenceRule = (rule: RuleRef, position: RulePosition) => {
    for (let pathPos = 0; pathPos < this.#stacks.getStackSize(rule.value); pathPos++) {
      const nextPosition = [{
        ...position,
        rulePos: position.rulePos + 1,
      },];
      this.addPosition(rule.value, pathPos, 0, nextPosition);
    }
  };

  *[Symbol.iterator](): IterableIterator<{ rule: Rule; position: RulePosition; }> {
    for (const position of this.#positions) {
      const { rule, } = this.getRule(position);
      if (isRuleRef(rule)) {
        this.delete(position);
        this.addReferenceRule(rule, position);
      } else if (isRuleEnd(rule)) {
        if (position.previous) {
          this.delete(position);
          for (const { stackPos, pathPos, rulePos, previous, } of position.previous) {
            this.addPosition(stackPos, pathPos, rulePos, previous);
          }
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
    const { rule: nextRule, } = this.getRule({
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
