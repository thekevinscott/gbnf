MAXIMUM_NUMBER_OF_ERROR_LINES_TO_SHOW = 3


def GRAMMAR_PARSER_ERROR_HEADER_MESSAGE(reason: str) -> str:
    return f"Failed to parse grammar: {reason}"


INPUT_PARSER_ERROR_HEADER_MESSAGE = "Failed to parse input string:"


class GrammarParseError(Exception):
    def __init__(self, grammar: str, pos: int, reason: str):
        super().__init__(
            GRAMMAR_PARSER_ERROR_HEADER_MESSAGE(reason)
            + "\n".join(build_error_position(grammar, pos)),
        )
        self.grammar = grammar
        self.pos = pos
        self.reason = reason
        self.name = "GrammarParseError"


class InputParseError(Exception):
    def __init__(self, src: str, pos: int):
        super().__init__(
            INPUT_PARSER_ERROR_HEADER_MESSAGE
            + "\n".join(build_error_position(get_input_as_string(src), pos)),
        )
        self.src = src
        self.pos = pos
        self.name = "InputParseError"


def build_error_position(src: str, pos: int) -> list:
    grammar_lines = src.split("\n")
    line_idx = 0
    while line_idx < len(grammar_lines) and pos > len(grammar_lines[line_idx]) - 1:
        pos -= len(grammar_lines[line_idx]) + 1
        line_idx += 1

    start_line = max(0, line_idx - (MAXIMUM_NUMBER_OF_ERROR_LINES_TO_SHOW - 1))
    # Use a list comprehension to create the lines_to_show list
    lines_to_show = [
        grammar_lines[i]
        for i in range(start_line, line_idx + 1)
        if i < len(grammar_lines)
    ]

    # Append the position marker
    lines_to_show.append(" " * pos + "^")

    return lines_to_show


def get_input_as_string(src: str | int | list[int]) -> str:
    if isinstance(src, str):
        return src
    if isinstance(src, list):
        return "".join(chr(cp) for cp in src)
    return str(chr(src))
