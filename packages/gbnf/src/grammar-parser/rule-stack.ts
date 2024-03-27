import { Rule, } from "../types.js";

export class RuleStack {
  paths: Rule[][];
  valid: boolean[];

  constructor(rules: Rule[][]) {
    this.paths = rules;
    this.valid = Array(rules.length).fill('').map(() => true);
  }

  public getStack(idx: number) {
    return this.paths[idx];
  }

}
