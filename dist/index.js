'use strict';

var util = require('util');

class Variable {
    constructor(value) {
        this.value = value;
    }
    valueOf() {
        return this.value;
    }
    toString() {
        return String(this.value);
    }
    toJSON() {
        return this.value;
    }
}

class StringVariable extends Variable {
    constructor(value) {
        super(value);
    }
    /**
     * Compares this string variable with another one (case insensitive). Since
     * this returns a number, it can be used for both equality check and for
     * sorting.
     * @param compareWith
     */
    compare(compareWith) {
        return String(this.value).toLowerCase().localeCompare(compareWith.valueOf().toLowerCase());
    }
    op(operator, right) {
        if (!(right instanceof StringVariable)) {
            right = new StringVariable(String(right));
        }
        switch (operator) {
            case "eq":
                return this.value.toLowerCase() === right.value.toLowerCase();
            case "ne":
                return this.value.toLowerCase() != right.value.toLowerCase();
            case "lt":
                return this.compare(right) < 0;
            case "le":
                return this.compare(right) <= 0;
            case "gt":
                return this.compare(right) > 0;
            case "ge":
                return this.compare(right) >= 0;
            case "co":
                return this.value.toLowerCase().includes(right.value.toLowerCase());
            case "sw":
                return this.value.toLowerCase().startsWith(right.value.toLowerCase());
            case "ew":
                return this.value.toLowerCase().endsWith(right.value.toLowerCase());
            default:
                throw new Error(`Operator "${operator}" not supported for string variables`);
        }
    }
}

class NumberVariable extends Variable {
    constructor(value) {
        super(value);
    }
    op(operator, right) {
        switch (operator) {
            case "eq":
                return this.value === +String(right);
            case "ne":
                return this.value !== +String(right);
            case "gt":
                return this.value > +String(right);
            case "ge":
                return this.value >= +String(right);
            case "lt":
                return this.value < +String(right);
            case "le":
                return this.value <= +String(right);
            default:
                throw new Error(`Operator "${operator}" not supported for number variables`);
        }
    }
}

class DateVariable extends Variable {
    constructor(value) {
        // YYYY
        if (value.length === 4) {
            super(new Date(+value, 0, 1, 0, 0, 0, 1));
            this.precision = "year";
        }
        // YYYY-MM
        else if (value.length === 7) {
            const [year, month] = value.split("-");
            super(new Date(+year, +month - 1, 1, 0, 0, 0, 1));
            this.precision = "month";
        }
        // YYYY-MM-DD
        else if (value.length === 10) {
            const [year, month, day] = value.split("-");
            super(new Date(+year, +month - 1, +day, 0, 0, 0, 1));
            this.precision = "day";
        }
        // YYYY-MM-DDTHH:mm:dd...
        else {
            super(new Date(value));
            this.precision = "millisecond";
        }
    }
    /**
     * Compares this string variable with another one (case insensitive). Since
     * this returns a number, it can be used for both equality check and for
     * sorting.
     * @param compareWith
     */
    compare(compareWith) {
        const thisDate = this.value;
        const thatDate = compareWith.value;
        switch (compareWith.precision) {
            case "year":
                return ((new Date(thisDate.getFullYear(), 0).valueOf()) -
                    (new Date(thatDate.getFullYear(), 0).valueOf()));
            case "month":
                return (new Date(thisDate.getFullYear(), thisDate.getMonth()).valueOf() -
                    new Date(thatDate.getFullYear(), thatDate.getMonth()).valueOf());
            case "day":
                return (new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate(), 0, 0, 0, 1).valueOf() -
                    new Date(thatDate.getFullYear(), thatDate.getMonth(), thatDate.getDate(), 0, 0, 0, 1).valueOf());
            default:
                return thisDate.valueOf() - thatDate.valueOf();
        }
    }
    /**
     * Date is the same including same precision and time zone if provided
     * @param needle
     */
    contains(needle) {
        const thisDate = this.value;
        const thatDate = needle.value;
        switch (this.precision) {
            case "year":
                return ((new Date(thatDate.getFullYear(), 0).valueOf()) ===
                    (new Date(thisDate.getFullYear(), 0).valueOf()));
            case "month":
                return (new Date(thatDate.getFullYear(), thatDate.getMonth()).valueOf() ===
                    new Date(thisDate.getFullYear(), thisDate.getMonth()).valueOf());
            case "day":
                return (new Date(thatDate.getFullYear(), thatDate.getMonth(), thatDate.getDate(), 0, 0, 0, 1).valueOf() ===
                    new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate(), 0, 0, 0, 1).valueOf());
            default:
                return thatDate.valueOf() === thisDate.valueOf();
        }
    }
    start() {
        switch (this.precision) {
            case "year":
                return new Date(this.value.getFullYear(), 0, 1, 0, 0, 0, 0);
            case "month":
                return new Date(this.value.getFullYear(), this.value.getMonth(), 1, 0, 0, 0, 0);
            case "day":
                return new Date(this.value.getFullYear(), this.value.getMonth(), this.value.getDate(), 0, 0, 0, 0);
            default:
                return new Date(this.value);
        }
    }
    end() {
        switch (this.precision) {
            case "year":
                return new Date(this.value.getFullYear(), 11, 31, 23, 59, 59, 999);
            case "month":
                return new Date(this.value.getFullYear(), this.value.getMonth() + 1, -1, 23, 59, 59, 999);
            case "day":
                return new Date(this.value.getFullYear(), this.value.getMonth(), this.value.getDate(), 23, 59, 59, 999);
            default:
                return new Date(this.value);
        }
    }
    overlaps(needle) {
        // --- |   - | -   |  -  | --- | --- | --- | -   |   - |
        // --- | --- | --- | --- | -   |   - |  -  |   - | -   |
        //  1  |  1  |  1  |  1  |  1  |  1  |  1  |  0  |  0  |
        return !(this.start() > needle.end() || this.end() < needle.start());
    }
    op(operator, right) {
        switch (operator) {
            case "eq":
                return this.compare(right) === 0;
            case "ne":
                return this.compare(right) !== 0;
            case "gt":
                return this.compare(right) > 0;
            case "ge":
                return this.compare(right) >= 0;
            case "lt":
                return this.compare(right) < 0;
            case "le":
                return this.compare(right) <= 0;
            case "co":
                return this.contains(right);
            case "po":
                return this.overlaps(right);
            default:
                throw new Error(`Operator "${operator}" not supported for dates`);
        }
    }
}

class TokenVariable extends Variable {
    constructor(value) {
        super(value);
    }
    /**
     * Compares this token with another one (case insensitive). Since
     * this returns a number, it can be used for both equality check and for
     * sorting.
     * @param compareWith
     */
    compare(compareWith) {
        return String(this.value).toLowerCase().localeCompare(compareWith.valueOf().toLowerCase());
    }
    op(operator, right) {
        switch (operator) {
            case "eq": // equal
                return this.compare(right) === 0;
            case "ne": // not equal
                return this.compare(right) !== 0;
            case "ss": // True if the value subsumes a concept in the set
            case "sb": // True if the value is subsumed by a concept in the set
            case "in": // True if one of the concepts is in the nominated value set by URI, either a relative, literal or logical vs
                throw new Error(`Operator "${operator}" not implemented for tokens`);
            default:
                throw new Error(`Operator "${operator}" not supported for token variables`);
        }
    }
}

class QuantityVariable extends Variable {
    constructor(input) {
        const match = input.match(/^(-?(0|[1-9][0-9]*)(\.[0-9]+)?)([a-z]+)$/i);
        super(+match[1]);
        this.unit = match[4];
    }
    toString() {
        return this.value + this.unit;
    }
    toJSON() {
        return {
            value: this.value,
            unit: this.unit
        };
    }
    op(operator, right) {
        if (this.unit.toLowerCase() !== right.unit.toLowerCase()) {
            throw new Error(`Cannot compare quantities with different units`);
        }
        switch (operator) {
            case "eq":
                return this.value == right.value;
            case "ne":
                return this.value != right.value;
            case "lt":
                return this.value < right.value;
            case "le":
                return this.value <= right.value;
            case "gt":
                return this.value > right.value;
            case "ge":
                return this.value >= right.value;
            default:
                throw new Error(`Operator "${operator}" not supported for quantity variables`);
        }
    }
}

var COMPARISON_OPERATORS;
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
var LOGICAL_OPERATORS;
(function (LOGICAL_OPERATORS) {
    LOGICAL_OPERATORS["or"] = "or";
    LOGICAL_OPERATORS["and"] = "and";
})(LOGICAL_OPERATORS || (LOGICAL_OPERATORS = {}));
var KEYWORDS;
(function (KEYWORDS) {
    KEYWORDS["true"] = "true";
    KEYWORDS["false"] = "false";
    KEYWORDS["null"] = "null";
    KEYWORDS["not"] = "not";
})(KEYWORDS || (KEYWORDS = {}));
var TOKEN_TYPES;
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
const RE_DATE_TIME = /^([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?$/;
const RE_NUMBER = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?(\s|$|\))/;
const RE_IDENTIFIER = /^[_a-zA-Z$][_\-0-9a-zA-Z$]*$/;
const RE_QUANTITIY = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?([a-z]+)$/i;

class PathLexeme {
    constructor(content) {
        this.type = "paramPath";
        this.content = content;
    }
    toString() {
        return this.content.reduce((prev, cur) => {
            let out = String(cur);
            if (prev) {
                if (cur instanceof FilterLexeme) {
                    out = prev + out;
                }
                else {
                    out = prev + "." + out;
                }
            }
            return out;
        }, "");
    }
}
class FilterLexeme {
    constructor(content) {
        this.type = "filter";
        this.content = content;
    }
    toString() {
        return "[" + this.content.map(x => x.toString()).join(" ") + "]";
    }
}
class CompValueLexeme {
    constructor(content) {
        this.type = "compValue";
        this.content = content;
    }
    toString() {
        return this.content.content.toString();
    }
}
class BlockLexeme {
    constructor(content) {
        this.type = "block";
        this.content = [content];
    }
    toString() {
        return "(" + this.content[0].toString() + ")";
    }
}
class NegationLexeme {
    constructor(content) {
        this.type = "negation";
        this.content = [content];
    }
    toString() {
        return "not(" + this.content[0].toString() + ")";
    }
}
class LogExpLexeme {
    constructor(content) {
        this.type = "logExp";
        this.content = content;
    }
    toString() {
        return this.content.map(x => x.toString()).join(" ");
    }
}
class ParamExpLexeme {
    constructor(content) {
        this.type = "paramExp";
        this.content = content;
    }
    toString() {
        return this.content.map(x => x.toString()).join(" ");
    }
}

const debug = util.debuglog("filter:lex");
function compValue$1(lexeme) {
    let out;
    switch (lexeme.content.type) {
        case "string":
            out = new StringVariable(JSON.parse(lexeme.content.content + ""));
            break;
        case "number":
            out = new NumberVariable(+lexeme.content.content);
            break;
        case "date":
            out = new DateVariable(lexeme.content.content + "");
            break;
        case "token":
            out = new TokenVariable(lexeme.content.content + "");
            break;
        case "quantity":
            out = new QuantityVariable(lexeme.content.content + "");
            break;
    }
    debug(`▶ evaluate.compValue %o ━━▶ %o`, lexeme + "", out);
    return out;
}
function operatorExpression(left, operator, right) {
    let out = left.op(operator, right);
    debug(`▶ evaluate.operatorExpression %o %o %o ━━▶ %o`, left, operator, right, out);
    return out;
}
function identifier(context, identifier) {
    let value = context[identifier];
    let out;
    if (typeof value === "number") {
        out = new NumberVariable(value);
    }
    else if (typeof value === "string") {
        if (value.match(RE_DATE_TIME)) {
            out = new DateVariable(value);
        }
        else {
            out = new StringVariable(value);
        }
    }
    else if (value && typeof value === "object") {
        out = value;
    }
    else if (value === undefined) {
        out = value;
    }
    else {
        out = new TokenVariable(value + "");
    }
    debug(`▶ evaluate.identifier %o against %j ━━▶ %o`, identifier, context, out);
    return out;
}
function paramExp$1(context, expression) {
    const left = path(context, expression.content[0]);
    if (left) {
        const operator = expression.content[1].content;
        const right = compValue$1(expression.content[2]);
        if (operator === "re") {
            if (left instanceof Variable) {
                throw new Error(`The "re" operator can only be used on objects`);
            }
            return typeof left === "object" && left.reference === String(right);
        }
        let out = operatorExpression(left, operator, right);
        debug(`▶ evaluate.paramExp %o against %j ━━▶ %o`, String(expression), context, out);
        return out;
    }
    debug(`▶ evaluate.paramExp %o against %j ━━▶ %o`, String(expression), context, false);
    return false;
}
function path(context, path) {
    let out = path.content.reduce((prev, cur) => {
        if (!prev) {
            return prev;
        }
        switch (cur.type) {
            case "filter":
                return filter$1(prev, cur.content[0]) ? prev : undefined;
            case "identifier":
                return identifier(prev, cur.content + "");
        }
    }, context);
    debug(`▶ evaluate.path %o against %j ━━▶ %o`, path + "", context, out);
    return out;
}
// logExp = filter ("and" | "or" filter)+
function logExp$1(context, expression) {
    let result = filter$1(context, expression.content[0].content[0]);
    switch (expression.content[1].content) {
        case "and":
            result = (result && filter$1(context, expression.content[2].content[0]));
            break;
        case "or":
            result = (result || filter$1(context, expression.content[2].content[0]));
            break;
    }
    debug(`▶ evaluate.logExp %o against %j ━━▶ %o`, expression + "", context, !!result);
    return !!result;
}
// filter = paramExp | logExp | (filter) | not(filter)
function filter$1(context, lexeme) {
    let out;
    if (lexeme instanceof ParamExpLexeme) {
        if (paramExp$1(context, lexeme))
            out = context;
    }
    else if (lexeme instanceof LogExpLexeme) {
        if (logExp$1(context, lexeme))
            out = context;
    }
    else if (lexeme instanceof FilterLexeme) {
        out = filter$1(context, lexeme.content[0]);
    }
    else if (lexeme instanceof BlockLexeme) {
        out = filter$1(context, lexeme.content[0].content[0]);
    }
    else { // NegationLexeme
        out = filter$1(context, lexeme.content[0].content[0]) ? undefined : context;
    }
    debug(`▶ evaluate.filter %o against %j ━━▶ %o`, lexeme + "", context, out);
    return out;
}

// ----------------------------------------------------------------------------
// Matchers
// Scan the token stream and return the length of the match (or 0)
// ----------------------------------------------------------------------------
function is(token, options) {
    let out = true;
    if (options.type) {
        out = out && token.type === options.type;
    }
    if (options.content) {
        out = out && token.content === options.content;
    }
    return out;
}
function isType(token, type) {
    return token.type === type;
}
function hasContent(token, content) {
    return token.content === content;
}
function isSequence(tokens, sequence) {
    let end = 0;
    if (sequence.every((matcher, i) => {
        if (end >= tokens.length) {
            return false;
        }
        if (typeof matcher === "string") {
            if (hasContent(tokens[end], matcher)) {
                end += 1;
                return true;
            }
        }
        else if (typeof matcher === "function") {
            let sub = matcher(tokens.slice(end));
            if (sub) {
                end += sub;
                return true;
            }
        }
        else if (is(tokens[end], matcher)) {
            end += 1;
            return true;
        }
        return false;
    })) {
        return end;
    }
    return 0;
}
function isOneOf(tokens, sequence) {
    let end = 0;
    if (sequence.some((matcher, i) => {
        // if (typeof matcher === "string") {
        //     if (hasContent(tokens[end], matcher)) {
        //         end += 1
        //         return true
        //     }
        // }
        // else
        // if (typeof matcher === "function") {
        let sub = matcher(tokens.slice(end));
        if (sub) {
            end += sub;
            return true;
        }
        return false;
        // }
        // else if (is(tokens[end], matcher)) {
        //     end += 1
        //     return true
        // }
    })) {
        return end;
    }
    return 0;
}
// filter = paramExp | logExp | ( filter ) | not ( filter )
function isFilter(tokens, greedy = true) {
    let pos = isOneOf(tokens, [
        t => isSequence(t, ["not", "(", isFilter, ")"]),
        t => isSequence(t, ["(", isFilter, ")"]),
        isParamExp
    ]);
    if (pos && greedy) {
        pos += isSequence(tokens.slice(pos), ["and", isFilter]);
        pos += isSequence(tokens.slice(pos), ["or", isFilter]);
    }
    return pos;
}
// paramExp = paramPath SP compareOp SP compValue
function isParamExp(tokens, full = false) {
    let len = isSequence(tokens, [
        isParamPath,
        { type: "operator" },
        isCompValue
    ]);
    if (full && len < tokens.length) {
        len = 0;
    }
    return len;
}
// logExp = filter ("and" / "or" filter)+
function isLogExp(tokens) {
    let pos = isFilter(tokens, false);
    if (!pos) {
        return 0;
    }
    let end = pos;
    while (end && end < tokens.length) {
        if (!hasContent(tokens[end], "and") && !hasContent(tokens[end], "or"))
            break;
        let nextPos = isFilter(tokens.slice(end + 1));
        if (!nextPos) {
            break;
        }
        end += nextPos + 1;
    }
    let len = end > pos ? end : 0;
    if (len < tokens.length) {
        len = 0;
    }
    return len;
}
// paramName (("[" filter "]") "." paramPath)
function isParamPath(tokens) {
    let len = 0;
    let result = tokens[0] && isType(tokens[0], "identifier");
    if (result) {
        len = 1;
        len += isSequence(tokens.slice(1), ["[", isFilter, "]"]);
        if (tokens[len] && is(tokens[len], { type: "punctoator", content: "." })) {
            len += 1;
            len += isParamPath(tokens.slice(len));
        }
    }
    return len;
}
function isCompValue(tokens) {
    return (tokens[0] && ["string", "number", "date", "token", "quantity"].includes(tokens[0].type)) ? 1 : 0;
}
// Lexers ---------------------------------------------------------------------
// filter = paramExp | logExp | ("not") "(" filter ")"
function filter(tokens, skipLogExp = false) {
    if (!skipLogExp && isLogExp(tokens)) {
        return new FilterLexeme([logExp(tokens, true)]);
    }
    if (isParamExp(tokens)) {
        const content = paramExp(tokens);
        return new FilterLexeme([content]);
    }
    if (isSequence(tokens, ["(", isFilter, ")"])) {
        tokens.shift();
        const content = filter(tokens);
        tokens.shift();
        return new BlockLexeme(content);
    }
    if (isSequence(tokens, ["not", "(", isFilter, ")"])) {
        tokens.shift();
        tokens.shift();
        const content = filter(tokens);
        tokens.shift();
        return new NegationLexeme(content);
    }
    throw new Error(`Expected valid filter expression`);
}
// logExp = filter ("and" | "or" filter)+
function logExp(tokens, skipFilterCheck = false) {
    let out = [filter(tokens, true)];
    while (tokens.length > 0 && (hasContent(tokens[0], "and") || hasContent(tokens[0], "or"))) {
        out.push(tokens.shift(), filter(tokens, true));
    }
    return new LogExpLexeme(out);
}
// paramExp = paramPath SP compareOp SP compValue
function paramExp(tokens) {
    return new ParamExpLexeme([
        paramPath(tokens),
        tokens.shift(),
        compValue(tokens)
    ]);
}
// paramPath = paramName (("[" filter "]") "." paramPath)
function paramPath(tokens) {
    let out = new PathLexeme([tokens[0]]);
    tokens.shift();
    let filterLen = isSequence(tokens, ["[", isFilter, "]"]);
    if (filterLen) {
        tokens.shift();
        out.content.push(filter(tokens));
        tokens.shift();
    }
    if (isSequence(tokens, [".", isParamPath])) {
        tokens.shift();
        out.content = out.content.concat(paramPath(tokens).content);
    }
    return out;
}
// compValue = string | numberOrDate | token
function compValue(tokens) {
    return new CompValueLexeme(tokens.shift());
}

class Token {
    constructor(type, start, end, content) {
        this.type = type;
        this.start = start;
        this.end = end;
        this.content = content;
    }
    toString() {
        return this.content;
    }
}

function tokenize(input) {
    const len = input.length;
    let tokens = [];
    let pos = 0;
    let mode;
    let buffer = "";
    let start = 0;
    function open(data, modeOverride) {
        if (buffer) {
            close();
        }
        mode = modeOverride;
        buffer = data;
        start = pos; // - 1;
    }
    function close(data = "") {
        if (data) {
            buffer += data;
        }
        if (buffer) {
            if (!mode) {
                if (["true", "false", "null"].includes(buffer)) {
                    mode = "token";
                }
                else if (buffer in KEYWORDS) {
                    mode = "keyword";
                }
                else if (buffer in LOGICAL_OPERATORS) {
                    mode = "operator";
                }
                else if (buffer in COMPARISON_OPERATORS) {
                    mode = "operator";
                }
                else if (buffer.match(RE_IDENTIFIER)) {
                    mode = "identifier";
                }
                else if (buffer.match(RE_NUMBER)) {
                    mode = "number";
                }
                else if (buffer.match(RE_DATE_TIME)) {
                    mode = "date";
                }
                else if (buffer.match(RE_QUANTITIY)) {
                    mode = "quantity";
                }
                else {
                    mode = "token";
                }
            }
            tokens.push(new Token(mode, start, pos + data.length, buffer));
            buffer = "";
        }
        mode = undefined;
        start = pos + 1;
    }
    while (pos < len) {
        const char = input[pos];
        switch (char) {
            case '"':
                if (mode === "string") {
                    close('"');
                }
                else {
                    open('"', "string");
                }
                break;
            case "\\":
                if (mode === "string" && input[pos + 1] === '"') {
                    buffer += '\\\"';
                    pos += 1;
                }
                else {
                    buffer += char;
                }
                break;
            case " ":
            case "\t":
            case "\r":
                if (mode === "string") {
                    buffer += char;
                }
                else {
                    close();
                }
                break;
            case "(":
            case ")":
            case "[":
            case "]":
                if (mode === "string") {
                    buffer += char;
                }
                else {
                    open("", "punctoator");
                    close(char);
                }
                break;
            case ".":
                if (mode === "string") {
                    buffer += char;
                }
                else if (buffer.match(/[0-9]$/)) {
                    buffer += char;
                }
                else {
                    open("", "punctoator");
                    close(char);
                }
                break;
            default:
                buffer += char;
                break;
        }
        pos += 1;
    }
    if (mode === "string") {
        throw new Error("Unterminated string literal");
    }
    close();
    return tokens;
}

function fhirFilter(data, f) {
    return data.filter(fhirFilter.create(f));
}
fhirFilter.create = function createFilter(f) {
    let tok = tokenize(f);
    let ast = filter(tok);
    if (!ast || tok.length) {
        throw new Error(`Failed to parse filter expression`);
    }
    return (ctx, i, all) => {
        try {
            return !!filter$1(ctx, ast.content[0]);
        }
        catch (ex) {
            ex.message = `Error applying filter to item ${i}: ` +
                ex.message;
            throw ex;
        }
    };
};

module.exports = fhirFilter;
