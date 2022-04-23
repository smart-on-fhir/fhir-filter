import { describe, it }                            from "mocha"
import { expect }                                  from "chai"
import { tokenize }                                from "../src/tokenizer"
import { COMPARISON_OPERATORS, LOGICAL_OPERATORS } from "../src/config"


describe("tokenize", () => {
    it ("detects all token types", () => {
        const map = {
            "["      : "punctoator",
            "]"      : "punctoator",
            "("      : "punctoator",
            ")"      : "punctoator",
            "."      : "punctoator",
            "a"      : "identifier",
            "_aBc"   : "identifier",
            "a-b"    : "identifier",
            "4"      : "number"    ,
            "-3"     : "number"    ,
            "3.45"   : "number"    ,
            "-3.6"   : "number"    ,
            "true"   : "token"     ,
            "false"  : "token"     ,
            "null"   : "token"     ,
            '"x"'    : "string"    ,
            '"["'    : "string"    ,
            '"]"'    : "string"    ,
            '"("'    : "string"    ,
            '")"'    : "string"    ,
            '"\\""'  : "string"    ,
            '"."'    : "string"    ,
            '2020-01': "date"      ,
            '-10mg'  : "quantity"  ,
            '200g'   : "quantity"  ,
            '12xy34' : "token"     ,
            // "undefined"  : "token" ,
        };

        for (const token in map) {
            const result = tokenize(token)
            expect(result[0]).to.deep.equal({
                type   : map[token as keyof typeof map],
                start  : 0,
                end    : token.length,
                content: token
            })
        }

        for (const token of COMPARISON_OPERATORS) {
            const result = tokenize(token)
            expect(result[0]).to.deep.equal({
                type: "operator",
                start: 0,
                end: token.length,
                content: token
            })
        }

        for (const token of LOGICAL_OPERATORS) {
            const result = tokenize(token)
            expect(result[0]).to.deep.equal({
                type: "operator",
                start: 0,
                end: token.length,
                content: token
            })
        }

        // expect(tokenize("a[b eq c].d eq 6").map(t => ([t.type, t.content]))).to.deep.equal([
        //     ["identifier", "a"],
        //     ["punctoator", "["],
        //     ["identifier", "b"],
        //     ["operator", "eq"],
        //     ["identifier", "c"],
        //     ["punctoator", "]"],
        //     ["punctoator", "."],
        //     ["identifier", "d"],
        //     ["operator", "eq"],
        //     ["number", "6"]
        // ])
    });

    it ("throws in case of unterminated strings", () => {
        expect(() => tokenize('"test')).to.throw("Unterminated string literal")
    })
})
