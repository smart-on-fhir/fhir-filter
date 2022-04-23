import { TokenType } from "..";
import { COMPARISON_OPERATORS, KEYWORDS, LOGICAL_OPERATORS, RE_DATE_TIME, RE_IDENTIFIER, RE_NUMBER, RE_QUANTITIY } from "./config";
import Token from "./tokens/Token";

export function tokenize(input: string)
{
    const len = input.length;
    let tokens: Token[] = [];

    let pos    = 0;
    let mode   = "";
    let buffer = ""
    let start  = 0;

    function open(data: string, modeOverride: string) {
        if (buffer) {
            close();
        }
        mode   = modeOverride;
        buffer = data;
        start  = pos// - 1;
    }

    function close(data = "") {
        if (data) {
            buffer += data
        }
        if (buffer) {

            if (!mode) {
                if (["true", "false", "null"].includes(buffer)) {
                    mode = "token"
                }
                else if (KEYWORDS.includes(buffer)) {
                    mode = "keyword"
                }
                else if (LOGICAL_OPERATORS.includes(buffer)) {
                    mode = "operator"
                }
                else if (COMPARISON_OPERATORS.includes(buffer)) {
                    mode = "operator"
                }
                else if (buffer.match(RE_IDENTIFIER)) {
                    mode = "identifier"
                }
                else if (buffer.match(RE_NUMBER)) {
                    mode = "number"
                }
                else if (buffer.match(RE_DATE_TIME)) {
                    mode = "date"
                }
                else if (buffer.match(RE_QUANTITIY)) {
                    mode = "quantity"
                }
                else {
                    mode = "token" 
                }
            }

            tokens.push(new Token(mode as TokenType, start, pos + data.length, buffer));
            buffer = "";
        }
        mode = "";
        start = pos + 1
    }

    while (pos < len) {
        const char = input[pos];

        switch (char) {

            case '"':
                if (mode === "string") {
                    close('"')
                } else {
                    open('"', "string")
                }
                break;

            case "\\":
                if (mode === "string" && input[pos + 1] === '"') {
                    buffer += '\\\"';
                    pos += 1;
                } else {
                    buffer += char;
                }
                break;
            
            case " " :
            case "\t":
            case "\r":
                if (mode === "string") {
                    buffer += char;
                } else {
                    close()
                }
                break;

            case "(":
            case ")":
            case "[":
            case "]":
                if (mode === "string") {
                    buffer += char;
                } else {
                    open("", "punctoator")
                    close(char)
                }
                break;

            case ".":
                if (mode === "string") {
                    buffer += char;
                } else if (buffer.match(/[0-9]$/)) {
                    buffer += char;
                } else {
                    open("", "punctoator")
                    close(char)
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
