export const COMPARISON_OPERATORS = [
    "eq", "ne", "co", "sw", "ew", "gt",
    "lt", "ge", "le", "ap", "sa", "eb",
    "pr", "po", "ss", "sb", "in", "ni",
    "re"
];
export const LOGICAL_OPERATORS = [
    "and", "or"
];
export const KEYWORDS = [
    "true", "false", "null", "not"
];
export const RE_DATE_TIME = /^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?$/;
export const RE_NUMBER = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?(\s|$|\))/;
export const RE_IDENTIFIER = /^[_a-zA-Z$][_\-0-9a-zA-Z$]*$/;
export const RE_QUANTITIY = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?([a-z]+)$/i;
