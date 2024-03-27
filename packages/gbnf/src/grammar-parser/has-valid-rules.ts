import { Rule, } from "../types.js";

export const hasValidRules = (rules: Rule[]): boolean => rules.length > 0;
