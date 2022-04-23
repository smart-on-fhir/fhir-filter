export enum COMPARISON_OPERATORS {
    eq = "eq",
    ne = "ne",
    co = "co",
    sw = "sw",
    ew = "ew",
    gt = "gt",
    lt = "lt",
    ge = "ge",
    le = "le",
    ap = "ap",
    sa = "sa",
    eb = "eb",
    pr = "pr",
    po = "po",
    ss = "ss",
    sb = "sb",
    in = "in",
    ni = "ni",
    re = "re"
}

export enum LOGICAL_OPERATORS {
    or = "or",
    and = "and"
}

export enum KEYWORDS {
    true = "true",
    false = "false",
    null = "null",
    not = "not"
};

export enum TOKEN_TYPES {
    operator = "operator",
    identifier = "identifier",
    string = "string",
    number = "number",
    date = "date",
    paramExp = "paramExp",
    paramPath = "paramPath",
    punctoator = "punctoator",
    boolean = "boolean",
    keyword = "keyword",
    token = "token",
    quantity = "quantity"
};

export const RE_DATE_TIME  = /^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?$/;
export const RE_NUMBER     = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?(\s|$|\))/
export const RE_IDENTIFIER = /^[_a-zA-Z$][_\-0-9a-zA-Z$]*$/
export const RE_QUANTITIY = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?([a-z]+)$/i