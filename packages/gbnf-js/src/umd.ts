import { GBNF, } from './gbnf.js';
import { InternalRuleType, } from './rules-builder/types.js';
module.exports = GBNF;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
module.exports.RuleType = InternalRuleType;
