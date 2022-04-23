import { BlockLexeme, CompValueLexeme, FilterLexeme, LogExpLexeme, NegationLexeme, ParamExpLexeme, PathLexeme } from "./Lexemes";
// ----------------------------------------------------------------------------
// Matchers
// Scan the token stream and return the length of the match (or 0)
// ----------------------------------------------------------------------------
export function is(token, options) {
    let out = true;
    if (options.type) {
        out = out && token.type === options.type;
    }
    if (options.content) {
        out = out && token.content === options.content;
    }
    return out;
}
export function isType(token, type) {
    return token.type === type;
}
export function hasContent(token, content) {
    return token.content === content;
}
export function isSequence(tokens, sequence) {
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
export function isOneOf(tokens, sequence) {
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
export function isFilter(tokens, greedy = true) {
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
export function isParamExp(tokens, full = false) {
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
export function isLogExp(tokens) {
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
export function isParamPath(tokens) {
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
export function isCompValue(tokens) {
    return (tokens[0] && ["string", "number", "date", "token", "quantity"].includes(tokens[0].type)) ? 1 : 0;
}
// Lexers ---------------------------------------------------------------------
// filter = paramExp | logExp | ("not") "(" filter ")"
export function filter(tokens, skipLogExp = false) {
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
export function logExp(tokens, skipFilterCheck = false) {
    let out = [filter(tokens, true)];
    while (tokens.length > 0 && (hasContent(tokens[0], "and") || hasContent(tokens[0], "or"))) {
        out.push(tokens.shift(), filter(tokens, true));
    }
    return new LogExpLexeme(out);
}
// paramExp = paramPath SP compareOp SP compValue
export function paramExp(tokens) {
    return new ParamExpLexeme([
        paramPath(tokens),
        tokens.shift(),
        compValue(tokens)
    ]);
}
// paramPath = paramName (("[" filter "]") "." paramPath)
export function paramPath(tokens) {
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
export function compValue(tokens) {
    return new CompValueLexeme(tokens.shift());
}
