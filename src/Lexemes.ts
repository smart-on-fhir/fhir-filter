import Token from "./Token";

interface Lexeme<Type = string> {
    type: Type
    content: Token | (Token | Lexeme)[]
}


export class PathLexeme implements Lexeme {
    type = "paramPath"

    content: (Token | Lexeme)[];

    constructor(content: (Token | Lexeme)[]) {
        this.content = content;
    }

    toString(): string {
        return this.content.reduce((prev, cur) => {
            let out = String(cur);
            if (prev) {
                if (cur instanceof FilterLexeme) {
                    out = prev + out;
                } else {
                    out = prev + "." + out;
                }
            }
            return out;
        }, "");
    }
}

export class FilterLexeme implements Lexeme {
    type = "filter"
    
    content: (Token | Lexeme)[];

    constructor(content: (Token | Lexeme)[]) {
        this.content = content;
    }

    toString(): string {
        return "[" + this.content.map(x => x.toString()).join(" ") + "]";
    }
}

export class CompValueLexeme implements Lexeme {
    type = "compValue";

    content: Token<"string"|"number"|"date"|"token"|"quantity">;

    constructor(content: Token<"string"|"number"|"date"|"token"|"quantity">) {
        this.content = content;
    }

    toString(): string {
        return this.content.content.toString();
    }
}

export class BlockLexeme implements Lexeme {
    type = "block"
    
    content: [FilterLexeme];

    constructor(content: FilterLexeme) {
        this.content = [content];
    }

    toString(): string {
        return "(" + this.content[0].toString() + ")";
    }
}

export class NegationLexeme implements Lexeme {
    type = "negation"
    
    content: [FilterLexeme];

    constructor(content: FilterLexeme) {
        this.content = [content];
    }

    toString(): string {
        return "not(" + this.content[0].toString() + ")";
    }
}

export class LogExpLexeme implements Lexeme {
    type = "logExp"
    
    content: (FilterLexeme|Token)[];

    constructor(content: (FilterLexeme|Token)[]) {
        this.content = content;
    }

    toString(): string {
        return this.content.map(x => x.toString()).join(" ");
    }
}

export class ParamExpLexeme implements Lexeme {
    type = "paramExp"

    content: [PathLexeme, Token, CompValueLexeme];

    constructor(content: [PathLexeme, Token, CompValueLexeme]) {
        this.content = content;
    }

    toString(): string {
        return this.content.map(x => x.toString()).join(" ");
    }
}
