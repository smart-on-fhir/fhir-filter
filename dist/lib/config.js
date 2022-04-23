export var COMPARISON_OPERATORS;
(function (COMPARISON_OPERATORS) {
    COMPARISON_OPERATORS["eq"] = "eq";
    COMPARISON_OPERATORS["ne"] = "ne";
    COMPARISON_OPERATORS["co"] = "co";
    COMPARISON_OPERATORS["sw"] = "sw";
    COMPARISON_OPERATORS["ew"] = "ew";
    COMPARISON_OPERATORS["gt"] = "gt";
    COMPARISON_OPERATORS["lt"] = "lt";
    COMPARISON_OPERATORS["ge"] = "ge";
    COMPARISON_OPERATORS["le"] = "le";
    COMPARISON_OPERATORS["ap"] = "ap";
    COMPARISON_OPERATORS["sa"] = "sa";
    COMPARISON_OPERATORS["eb"] = "eb";
    COMPARISON_OPERATORS["pr"] = "pr";
    COMPARISON_OPERATORS["po"] = "po";
    COMPARISON_OPERATORS["ss"] = "ss";
    COMPARISON_OPERATORS["sb"] = "sb";
    COMPARISON_OPERATORS["in"] = "in";
    COMPARISON_OPERATORS["ni"] = "ni";
    COMPARISON_OPERATORS["re"] = "re";
})(COMPARISON_OPERATORS || (COMPARISON_OPERATORS = {}));
export var LOGICAL_OPERATORS;
(function (LOGICAL_OPERATORS) {
    LOGICAL_OPERATORS["or"] = "or";
    LOGICAL_OPERATORS["and"] = "and";
})(LOGICAL_OPERATORS || (LOGICAL_OPERATORS = {}));
export var KEYWORDS;
(function (KEYWORDS) {
    KEYWORDS["true"] = "true";
    KEYWORDS["false"] = "false";
    KEYWORDS["null"] = "null";
    KEYWORDS["not"] = "not";
})(KEYWORDS || (KEYWORDS = {}));
;
export var TOKEN_TYPES;
(function (TOKEN_TYPES) {
    TOKEN_TYPES["operator"] = "operator";
    TOKEN_TYPES["identifier"] = "identifier";
    TOKEN_TYPES["string"] = "string";
    TOKEN_TYPES["number"] = "number";
    TOKEN_TYPES["date"] = "date";
    TOKEN_TYPES["paramExp"] = "paramExp";
    TOKEN_TYPES["paramPath"] = "paramPath";
    TOKEN_TYPES["punctoator"] = "punctoator";
    TOKEN_TYPES["boolean"] = "boolean";
    TOKEN_TYPES["keyword"] = "keyword";
    TOKEN_TYPES["token"] = "token";
    TOKEN_TYPES["quantity"] = "quantity";
})(TOKEN_TYPES || (TOKEN_TYPES = {}));
;
export const RE_DATE_TIME = /^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?$/;
export const RE_NUMBER = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?(\s|$|\))/;
export const RE_IDENTIFIER = /^[_a-zA-Z$][_\-0-9a-zA-Z$]*$/;
export const RE_QUANTITIY = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?([a-z]+)$/i;
