import { TokenType } from "..";
import Token from "./tokens/Token";
import {
    BlockLexeme,
    CompValueLexeme,
    FilterLexeme,
    LogExpLexeme,
    NegationLexeme,
    ParamExpLexeme,
    PathLexeme
} from "./lexemes/Lexeme";

type matchFn = (tokens: Token[]) => number


// ----------------------------------------------------------------------------
// Matchers
// Scan the token stream and return the length of the match (or 0)
// ----------------------------------------------------------------------------
export function is(token: Token, options: { type?: TokenType, content?: string }) {
    let out = true;
    if (options.type) {
        out = out && token.type === options.type
    }
    if (options.content) {
        out = out && token.content === options.content
    }
    return out;
}

export function isType(token: Token, type: TokenType) {
    return token.type === type;
}

export function hasContent(token: Token, content: string) {
    return token.content === content;
}

export function isSequence(tokens: Token[], sequence: (string | { type: TokenType, content?: string } | matchFn)[]) {
    let end = 0;
    
    if (sequence.every((matcher, i) => {
        if (end >= tokens.length) {
            return false
        }

        if (typeof matcher === "string") {
            if (hasContent(tokens[end], matcher)) {
                end += 1
                return true
            }
        }

        else if (typeof matcher === "function") {
            let sub = matcher(tokens.slice(end))
            if (sub) {
                end += sub
                return true
            }
        }
        
        else if (is(tokens[end], matcher)) {
            end += 1
            return true
        }

        return false
    })) {
        return end
    }

    return 0
}

export function isOneOf(tokens: Token[], sequence: (
    // string |
    // { type: TokenType, content?: string } |
    matchFn
)[]) {
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
            let sub = matcher(tokens.slice(end))
            if (sub) {
                end += sub
                return true
            }
            return false
        // }
        
        // else if (is(tokens[end], matcher)) {
        //     end += 1
        //     return true
        // }
    })) {
        return end
    }

    return 0
}

// filter = paramExp | logExp | ( filter ) | not ( filter )
export function isFilter(tokens: Token[], greedy = true): number {

    let pos = isOneOf(tokens, [
        t => isSequence(t, [ "not", "(", isFilter, ")" ]),
        t => isSequence(t, [        "(", isFilter, ")" ]),
        isParamExp
    ]);

    if (pos && greedy) {
        pos += isSequence(tokens.slice(pos), [ "and", isFilter ])
        pos += isSequence(tokens.slice(pos), [ "or" , isFilter ])
    }

    return pos
}

// paramExp = paramPath SP compareOp SP compValue
export function isParamExp(tokens: Token[], full = false): number {
    let len = isSequence(tokens, [
        isParamPath,
        { type: "operator" },
        isCompValue
    ]);

    if (full && len < tokens.length) {
        len = 0
    }

    return len
}

// logExp = filter ("and" / "or" filter)+
export function isLogExp(tokens: Token[]) {
    
    let pos = isFilter(tokens, false)

    if (!pos) {
        return 0
    }

    let end = pos
    while (end && end < tokens.length) {
        if (!hasContent(tokens[end], "and") && !hasContent(tokens[end], "or"))
            break;
        let nextPos = isFilter(tokens.slice(end + 1));
        if (!nextPos) {
            break
        }
        end += nextPos + 1
    }

    let len = end > pos ? end : 0;
    
    if (len < tokens.length) {
        len = 0
    }

    return len
}

// paramName (("[" filter "]") "." paramPath)
export function isParamPath(tokens: Token[]) {
    let len = 0
    let result = tokens[0] && isType(tokens[0], "identifier");
    if (result) {
        len = 1
        len += isSequence(tokens.slice(1), ["[", isFilter, "]"]);
        if (tokens[len] && is(tokens[len], { type: "punctoator", content: "." })) {
            len += 1
            len += isParamPath(tokens.slice(len))
        }
    }
    return len
}

export function isCompValue(tokens: Token[]) {
    return (tokens[0] && [ "string", "number", "date", "token", "quantity" ].includes(tokens[0].type)) ? 1 : 0;
}



// Lexers ---------------------------------------------------------------------

// filter = paramExp | logExp | ("not") "(" filter ")"
export function lexFilter(tokens: Token[], skipLogExp = false): FilterLexeme | BlockLexeme | NegationLexeme {
    if (!skipLogExp && isLogExp(tokens)) {
        return new FilterLexeme([lexLogExp(tokens, true)!]);
    }

    if (isParamExp(tokens)) {
        const content = lexParamExp(tokens)
        return new FilterLexeme([content!]);
    }

    if (isSequence(tokens, ["(", isFilter, ")"])) {
        tokens.shift()
        const content = lexFilter(tokens);
        tokens.shift()
        return new BlockLexeme(content);
    }

    if (isSequence(tokens, ["not", "(", isFilter, ")"])) {
        tokens.shift()
        tokens.shift()
        const content: any = lexFilter(tokens);
        tokens.shift()
        return new NegationLexeme(content);
    }

    throw new Error(`Expected valid filter expression`)
}

// logExp = filter ("and" | "or" filter)+
export function lexLogExp(tokens: Token[], skipFilterCheck = false): LogExpLexeme {
    let out = [ lexFilter(tokens, true)! ];
    while (tokens.length > 0 && (hasContent(tokens[0], "and") || hasContent(tokens[0], "or"))) {
        out.push( tokens.shift() as any, lexFilter(tokens, true) );
    }
    return new LogExpLexeme(out);
}

// paramExp = paramPath SP compareOp SP compValue
export function lexParamExp(tokens: Token[]): ParamExpLexeme {
    return new ParamExpLexeme([
        lexParamPath(tokens),
        tokens.shift()!,
        lexCompValue(tokens)
    ])
}

// paramPath = paramName (("[" filter "]") "." paramPath)
export function lexParamPath(tokens: Token[]): PathLexeme {
            
    let out = new PathLexeme([ tokens[0] ]);

    tokens.shift()

    let filterLen = isSequence(tokens, ["[", isFilter, "]"]);
    if (filterLen) {
        tokens.shift();
        (out.content as any[]).push(lexFilter(tokens))
        tokens.shift();
    }

    if (isSequence(tokens, [".", isParamPath])) {
        tokens.shift();
        out.content = out.content.concat(lexParamPath(tokens).content)
    }

    return out;
}

// compValue = string | numberOrDate | token
export function lexCompValue(tokens: Token[]): CompValueLexeme {
    return new CompValueLexeme(tokens.shift()! as Token<"string"|"number"|"date"|"token"|"quantity">);
}
