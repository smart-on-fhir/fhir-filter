import { debuglog }        from "util"
import { RE_DATE_TIME }    from "./config"
import Variable            from "./dataTypes/Variable";
import StringVariable      from "./dataTypes/StringVariable";
import NumberVariable      from "./dataTypes/NumberVariable";
import DateVariable        from "./dataTypes/DateVariable";
import TokenVariable       from "./dataTypes/TokenVariable";
import QuantityVariable    from "./dataTypes/QuantityVariable";
import {
    BlockLexeme,
    CompValueLexeme,
    LogExpLexeme,
    NegationLexeme,
    ParamExpLexeme,
    PathLexeme,
    FilterLexeme
} from "./lexemes/Lexeme";
import {
    IdentifierToken,
    JSONObject,
    ComparisonOperator
} from "..";

const debug = debuglog("filter:lex")


export function evaluateCompValue(lexeme: CompValueLexeme): StringVariable | NumberVariable | DateVariable | TokenVariable | QuantityVariable {
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
    debug(`▶ evaluateCompValue %o ━━▶ %o`, lexeme + "", out)
    return out;
}

export function operatorExpression(left: any, operator: ComparisonOperator, right: Variable) {
    let out = left.op(operator, right);
    debug(`▶ operatorExpression %o %o %o ━━▶ %o`, left, operator, right, out)
    return out
}

export function evaluateIdentifier(context: JSONObject, identifier: string): any {
    let value = context[identifier];
    let out;

    if (typeof value === "number") {
        out = new NumberVariable(value);
    }
    else if (typeof value === "string") {
        if (value.match(RE_DATE_TIME)) {
            out = new DateVariable(value);
        } else {
            out = new StringVariable(value);
        }
    }
    else if (value && typeof value === "object") {
        out = value
        // return new ObjectVariable(value)
    }
    else if (value === undefined) {
        out = value
    }
    else {
        out = new TokenVariable(value + "");
    }
    debug(`▶ evaluateIdentifier %o against %j ━━▶ %o`, identifier, context, out)
    return out;
}

export function evaluateParamExp(context: JSONObject, expression: ParamExpLexeme): boolean {
    const left = evaluatePath(context, expression.content[0] as PathLexeme)
    if (left) {
        const operator = expression.content[1].content as ComparisonOperator
        const right = evaluateCompValue(expression.content[2])
        if (operator === "re") {
            if (left instanceof Variable) {
                throw new Error(`The "re" operator can only be used on objects`)
            }
            return typeof left === "object" && left.reference === String(right)
        }
        let out = operatorExpression(left, operator, right)
        debug(`▶ evaluateParamExp %o against %j ━━▶ %o`, String(expression), context, out)
        return out
    }
    debug(`▶ evaluateParamExp %o against %j ━━▶ %o`, String(expression), context, false)
    return false

}

export function evaluatePath(context: JSONObject, path: PathLexeme): Variable | JSONObject | undefined {
    let out = path.content.reduce((prev, cur) => {
        if (!prev) {
            return prev
        }
        switch (cur.type) {
            case "filter":
                return evaluateFilter(prev, (cur.content as any[])[0] as ParamExpLexeme) ? prev : undefined
            case "identifier":
                return evaluateIdentifier(prev, (cur as IdentifierToken).content)
        }
    }, context);
    debug(`▶ evaluatePath %o against %j ━━▶ %o`, path + "", context, out)
    return out
}

// logExp = filter ("and" | "or" filter)+
export function evaluateLogExp(context: JSONObject, expression: LogExpLexeme): boolean {
    let result = evaluateFilter(context, expression.content[0].content[0] as any)
    switch (expression.content[1].content) {
        case "and":
            result = (result && evaluateFilter(context, expression.content[2].content[0] as any))
        break;
        case "or":
            result = (result || evaluateFilter(context, expression.content[2].content[0] as any))
        break;
    }
    debug(`▶ evaluateLogExp %o against %j ━━▶ %o`, expression + "", context, !!result)
    return !!result
}

// filter = paramExp | logExp | (filter) | not(filter)
export function evaluateFilter(context: JSONObject, lexeme: ParamExpLexeme|LogExpLexeme|FilterLexeme|BlockLexeme|NegationLexeme): JSONObject | undefined {    
    let out;
    
    if (lexeme instanceof ParamExpLexeme) {
        if (evaluateParamExp(context, lexeme as ParamExpLexeme)) out = context
    }
    else if (lexeme instanceof LogExpLexeme) {
        if (evaluateLogExp(context, lexeme as LogExpLexeme)) out = context
    }
    else if (lexeme instanceof FilterLexeme) {
        out = evaluateFilter(context, lexeme.content[0] as FilterLexeme)
    }
    else if (lexeme instanceof BlockLexeme) {
        out = evaluateFilter(context, lexeme.content[0].content[0] as FilterLexeme);
    }
    else { // NegationLexeme
        out = evaluateFilter(context, lexeme.content[0].content[0] as FilterLexeme) ? undefined : context
    }

    debug(`▶ evaluateFilter %o against %j ━━▶ %o`, lexeme + "", context, out)
    return out
}
