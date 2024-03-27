import { RuleDef, } from "../types.js";

export class RuleStack {
  paths: RuleDef[][];
  valid: boolean[];

  constructor(rules: RuleDef[][]) {
    this.paths = rules;
    this.valid = Array(rules.length).fill('').map(() => true);
  }

  public getStack(idx: number) {
    return this.paths[idx];
  }

}
