import { debuglog } from "util";
import Variable from "./dataTypes/Variable";
import StringVariable from "./dataTypes/String";
import NumberVariable from "./dataTypes/Number";
import DateVariable from "./dataTypes/Date";
import TokenVariable from "./dataTypes/Token";
import QuantityVariable from "./dataTypes/Quantity";
import { RE_DATE_TIME } from "./config";
import { BlockLexeme, LogExpLexeme, ParamExpLexeme, FilterLexeme } from "./Lexemes";
const debug = debuglog("filter:lex");
export function compValue(lexeme) {
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
export function operatorExpression(left, operator, right) {
    let out = left.op(operator, right);
    debug(`▶ evaluate.operatorExpression %o %o %o ━━▶ %o`, left, operator, right, out);
    return out;
}
export function identifier(context, identifier) {
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
export function paramExp(context, expression) {
    const left = path(context, expression.content[0]);
    if (left) {
        const operator = expression.content[1].content;
        const right = compValue(expression.content[2]);
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
export function path(context, path) {
    let out = path.content.reduce((prev, cur) => {
        if (!prev) {
            return prev;
        }
        switch (cur.type) {
            case "filter":
                return filter(prev, cur.content[0]) ? prev : undefined;
            case "identifier":
                return identifier(prev, cur.content + "");
        }
    }, context);
    debug(`▶ evaluate.path %o against %j ━━▶ %o`, path + "", context, out);
    return out;
}
// logExp = filter ("and" | "or" filter)+
export function logExp(context, expression) {
    let result = filter(context, expression.content[0].content[0]);
    switch (expression.content[1].content) {
        case "and":
            result = (result && filter(context, expression.content[2].content[0]));
            break;
        case "or":
            result = (result || filter(context, expression.content[2].content[0]));
            break;
    }
    debug(`▶ evaluate.logExp %o against %j ━━▶ %o`, expression + "", context, !!result);
    return !!result;
}
// filter = paramExp | logExp | (filter) | not(filter)
export function filter(context, lexeme) {
    let out;
    if (lexeme instanceof ParamExpLexeme) {
        if (paramExp(context, lexeme))
            out = context;
    }
    else if (lexeme instanceof LogExpLexeme) {
        if (logExp(context, lexeme))
            out = context;
    }
    else if (lexeme instanceof FilterLexeme) {
        out = filter(context, lexeme.content[0]);
    }
    else if (lexeme instanceof BlockLexeme) {
        out = filter(context, lexeme.content[0].content[0]);
    }
    else { // NegationLexeme
        out = filter(context, lexeme.content[0].content[0]) ? undefined : context;
    }
    debug(`▶ evaluate.filter %o against %j ━━▶ %o`, lexeme + "", context, out);
    return out;
}
