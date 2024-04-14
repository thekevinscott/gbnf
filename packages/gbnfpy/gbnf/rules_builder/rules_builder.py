from datetime import datetime
from .errors import GrammarParseError
from .is_word_char import is_word_char
from .parse_char import parse_char
from .parse_name import parse_name
from .parse_space import parse_space
from .types import InternalRuleType, InternalRuleDef, SymbolIds


class RulesBuilder:
    def __init__(self, src: str, limit=1000):
        self.start = datetime.now()
        self.time_limit = limit
        self.symbol_ids = {}
        self.rules = []
        self.src = src
        self.pos = 0
        self.parse(src)

    def parse(self, src):
        self.pos = parse_space(src, 0, True)
        while self.pos < len(src):
            self.parse_rule(src)

        for rule in self.rules:
            for elem in rule:
                if elem["type"] == InternalRuleType.RULE_REF:
                    if (
                        elem["value"] >= len(self.rules)
                        or not self.rules[elem["value"]]
                    ):
                        for key, value in self.symbol_ids.items():
                            if value == elem["value"]:
                                raise GrammarParseError(
                                    src, self.pos, f"Undefined rule identifier '{key}'"
                                )

    def parse_rule(self, src):
        name = parse_name(src, self.pos)
        self.pos = parse_space(src, self.pos + len(name), False)
        rule_id = self.get_symbol_id(name)

        self.pos = parse_space(src, self.pos, True)
        if not (
            src[self.pos] == ":"
            and src[self.pos + 1] == ":"
            and src[self.pos + 2] == "="
        ):
            raise GrammarParseError(src, self.pos, f"Expecting ::= at {self.pos}")
        self.pos += 3
        self.pos = parse_space(src, self.pos, True)

        self.parse_alternates(name, rule_id)

        if src[self.pos] == "\r":
            self.pos += 2 if src[self.pos + 1] == "\n" else 1
        elif src[self.pos] == "\n":
            self.pos += 1
        elif src[self.pos]:
            raise GrammarParseError(
                src, self.pos, f"Expecting newline or end at {self.pos}"
            )
        self.pos = parse_space(src, self.pos, True)

    def get_symbol_id(self, name):
        if name not in self.symbol_ids:
            self.symbol_ids[name] = len(self.symbol_ids)
        return self.symbol_ids[name]

    def generate_symbol_id(self, base_name):
        next_id = len(self.symbol_ids)
        self.symbol_ids[f"{base_name}_{next_id}"] = next_id
        return next_id

    def add_rule(self, rule_id, rule):
        if rule_id >= len(self.rules):
            self.rules.extend([None] * (rule_id + 1 - len(self.rules)))
        self.rules[rule_id] = rule

    def check_duration(self):
        if (datetime.now() - self.start).total_seconds() * 1000 > self.time_limit:
            raise GrammarParseError(
                self.src, self.pos, f"duration of {self.time_limit} exceeded:"
            )

    def parse_sequence(self, rule_name, out_elements, depth=0):
        src = self.src
        last_sym_start = len(out_elements)
        is_nested = depth != 0
        while self.pos < len(src) and src[self.pos]:
            if src[self.pos] == '"':
                self.pos += 1
                last_sym_start = len(out_elements)
                while src[self.pos] != '"':
                    self.check_duration()
                    value, inc_pos = parse_char(src, self.pos)
                    out_elements.append(
                        {"type": InternalRuleType.CHAR, "value": [value]}
                    )
                    self.pos += inc_pos
                self.pos += 1
                self.pos = parse_space(src, self.pos, is_nested)
            # Additional parsing logic would be similar to the JavaScript implementation
            # Fill out the rest of the `parse_sequence` method based on your needs

    def parse_alternates(self, rule_name, rule_id, depth=0):
        src = self.src
        rule = []
        self.parse_sequence(rule_name, rule, depth)
        while self.pos < len(src) and src[self.pos] == "|":
            self.check_duration()
            rule.append({"type": InternalRuleType.ALT})
            self.pos += 1
            self.pos = parse_space(src, self.pos, True)
            self.parse_sequence(rule_name, rule, depth)
        rule.append({"type": InternalRuleType.END})
        self.add_rule(rule_id, rule)
