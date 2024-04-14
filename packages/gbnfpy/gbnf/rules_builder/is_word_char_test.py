from .is_word_char import is_word_char


def test_should_return_true_for_lowercase_letters():
    assert is_word_char("a") == True
    assert is_word_char("z") == True


def test_should_return_true_for_uppercase_letters():
    assert is_word_char("A") == True
    assert is_word_char("Z") == True


def test_should_return_false_for_digits():
    assert is_word_char("0") == False
    assert is_word_char("9") == False


def test_should_return_false_for_non_word_characters():
    assert is_word_char("-") == False
    assert is_word_char("@") == False
    assert is_word_char("_") == False
    assert is_word_char("?") == False
    assert is_word_char(" ") == False
