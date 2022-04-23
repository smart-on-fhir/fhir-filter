export type ComparisonOperator = "eq"|"ne"|"co"|"sw"|"ew"|"gt"|
    "lt"|"ge"|"le"|"ap"|"sa"|"eb"|"pr"|"po"|"ss"|"sb"|"in"|"ni"|"re";

export type TokenType = "operator" | "identifier" | "string" |
    "number" | "date" | "paramExp" | "paramPath" | "punctoator" |
    "boolean" | "keyword" | "token" | "quantity";

export interface Token {
    type: TokenType;
    start: number;
    end: number;
    content: string | Token[];
}

export interface BooleanToken extends Token {
    type: "boolean";
    content: "true" | "false";
}

export interface OperatorToken extends Token {
    type: "operator";
    content: ComparisonOperator;
}

export interface IdentifierToken extends Token {
    type: "identifier";
    content: string;
}

export interface StringToken extends Token {
    type: "string";
    content: string;
}

export interface CompValueToken extends Token {
    type: "string" | "number" | "date" | "token" | "quantity"; //| "identifier";
    content: string;
}

// ----------------------------------------------------------------------------
// LEXEMES
// ----------------------------------------------------------------------------
export interface Lexeme<Type = string> {
    type: Type
    content: Token | (Token | Lexeme)[]
}

export interface CompValueLexeme extends Lexeme {
    type: "compValue";
    content: CompValueToken;
}

export interface PathLexeme extends Lexeme {
    type: "paramPath";
    content: (Token | Lexeme)[];
}

// filter = paramExp / logExp / ("not") "(" filter ")"
export interface FilterLexeme extends Lexeme {
    type: "filter";
    content: (
        [ ParamExpressionLexeme         ] |
        [ LogicalExpressionLexeme       ] |
        [ "not", FilterToken           ] |
        [ "(", FilterToken, ")"        ] |
        [ "not", "(", FilterToken, ")" ]
    )
}

// paramExp = paramPath SP compareOp SP compValue
export interface ParamExpressionLexeme extends Lexeme {
    type: "paramExp";
    content: [ PathLexeme, OperatorToken, CompValueLexeme ];
}

// logExp = filter ("and" / "or" filter)+
export interface LogicalExpressionLexeme extends Lexeme {
    type: "logExp"
    content: [
        FilterLexeme,
        Token, // and | or
        FilterLexeme
    ]
}



export type JSONScalar = string | number | boolean | null;
export type JSONArray  = JSONValue[];
export type JSONObject = { [ key: string ]: JSONValue };
export type JSONValue  = JSONScalar | JSONArray | JSONObject;
