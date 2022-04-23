import { describe, it } from "mocha"
import { expect }       from "chai"
import { tokenize }     from "../src/tokenizer"
import { PathLexeme }   from ".."
import StringVariable   from "../src/dataTypes/StringVariable"
import NumberVariable   from "../src/dataTypes/NumberVariable"
import DateVariable     from "../src/dataTypes/DateVariable"
import TokenVariable    from "../src/dataTypes/TokenVariable"
import QuantityVariable from "../src/dataTypes/QuantityVariable"
import { lexCompValue, lexFilter, lexLogExp, lexParamExp, lexParamPath } from "../src/lexer"
import { evaluatePath, evaluateIdentifier, evaluateCompValue, evaluateParamExp, evaluateLogExp, evaluateFilter} from "../src/evaluate"


describe("evaluate", () => {

    describe("evaluateIdentifier", () => {
        it ("works", () => {
            expect(evaluateIdentifier({}, "a")).to.equal(undefined)
            expect(evaluateIdentifier({ a: 2 }, "a")?.valueOf()).to.equal(2)
            expect(evaluateIdentifier({ a: 2 }, "b")).to.equal(undefined)
        })
    })

    describe("evaluateCompValue", () => {
        it ("works with strings", () => {
            let ast = lexCompValue(tokenize('"a"'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(StringVariable)
            expect(out?.valueOf()).to.equal("a")
        })
        it ("works with integers", () => {
            let ast = lexCompValue(tokenize('5'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(NumberVariable)
            expect(out?.valueOf()).to.equal(5)
        })
        it ("works with negative integers", () => {
            let ast = lexCompValue(tokenize('-5'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(NumberVariable)
            expect(out?.valueOf()).to.equal(-5)
        })
        it ("works with floats", () => {
            let ast = lexCompValue(tokenize('5.3'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(NumberVariable)
            expect(out?.valueOf()).to.equal(5.3)
        })
        it ("works with negative floats", () => {
            let ast = lexCompValue(tokenize('-5.6'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(NumberVariable)
            expect(out?.valueOf()).to.equal(-5.6)
        })
        it ("works with YYYY-MM dates", () => {
            let ast = lexCompValue(tokenize('2020-05'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(DateVariable)
        })
        it ("works with YYYY-MM-DD dates", () => {
            let ast = lexCompValue(tokenize('2020-05-22'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(DateVariable)
        })
        it ("works with datetime", () => {
            let ast = lexCompValue(tokenize('2020-05-22T10:12:22.1234Z'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(DateVariable)
        })
        it ("works with 'true' tokens", () => {
            let ast = lexCompValue(tokenize('true'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(TokenVariable)
            expect(out?.valueOf()).to.equal("true")
        })
        it ("works with 'false' tokens", () => {
            let ast = lexCompValue(tokenize('false'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(TokenVariable)
            expect(out?.valueOf()).to.equal("false")
        })
        it ("works with 'null' tokens", () => {
            let ast = lexCompValue(tokenize('null'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(TokenVariable)
            expect(out?.valueOf()).to.equal("null")
        })
        it ("works with quantity", () => {
            let ast = lexCompValue(tokenize('100mg'));
            let out = evaluateCompValue(ast);
            expect(out).to.be.instanceOf(QuantityVariable)
            expect((out as QuantityVariable).valueOf()).to.equal(100)
            expect((out as QuantityVariable).unit).to.equal("mg")
        })
    });

    describe("evaluateParamExp", () => {
        it ("{ a: 3 } - a eq 3 => true", () => {
            let ast = lexParamExp(tokenize("a eq 3"));
            expect(evaluateParamExp({ a: 3 }, ast as any)).to.equal(true)
        })
        it ("{ a: 3 } - a gt 3 => false", () => {
            let ast = lexParamExp(tokenize("a gt 3"));
            expect(evaluateParamExp({ a: 3 }, ast as any)).to.equal(false)
        })
        it ("{ a: 3 } - a gt 3 or b eq 6 => false", () => {
            let tokens = tokenize("a gt 3 or b eq 6")
            let ast = lexParamExp(tokens);
            expect(evaluateParamExp({ a: 3 }, ast as any)).to.equal(false)
        })
        it ("compare string and tokens", () => {
            expect(evaluateParamExp({ a: "true" }, lexParamExp(tokenize("a eq true")) as any)).to.equal(true)
            expect(evaluateParamExp({ a: "true" }, lexParamExp(tokenize("a eq false")) as any)).to.equal(false)
        })
        it ("compare string and quantity", () => {
            expect(evaluateParamExp({ a: "100g" }, lexParamExp(tokenize("a eq 100g")) as any)).to.equal(true)
            expect(evaluateParamExp({ a: "100g" }, lexParamExp(tokenize("a eq 110g")) as any)).to.equal(false)
        })
        it ("compare string and numbers", () => {
            expect(evaluateParamExp({ a: "100" }, lexParamExp(tokenize("a eq 100")) as any)).to.equal(true)
            expect(evaluateParamExp({ a: "100" }, lexParamExp(tokenize("a eq 110")) as any)).to.equal(false)
        })
        it ("compare numbers and string", () => {
            expect(evaluateParamExp({ a: 100 }, lexParamExp(tokenize('a eq "100"')) as any)).to.equal(true)
            expect(evaluateParamExp({ a: 100 }, lexParamExp(tokenize('a eq "110"')) as any)).to.equal(false)
        })
        it ("compare numbers and quantity", () => {
            expect(evaluateParamExp({ a: 100 }, lexParamExp(tokenize('a eq 100g')) as any)).to.equal(false)
            expect(evaluateParamExp({ a: 100 }, lexParamExp(tokenize('a eq 110g')) as any)).to.equal(false)
        })
    })

    describe("evaluateLogExp", () => {
        it ("{ a: 3 } - a eq 5 or a ge 4 => false", () => {
            let ast = lexLogExp(tokenize("a eq 5 or a ge 4")) as any;
            expect(evaluateLogExp({ a: 3 }, ast)).to.equal(false)
        })
        it ("{ a: 3 } - a eq 5 or a ge 3 => true", () => {
            let ast = lexLogExp(tokenize("a eq 3 and a ge 3")) as any;
            expect(evaluateLogExp({ a: 3 }, ast)).to.equal(true)
        })
        it ("{ a: 3 } - a eq 3 and a ge 3 => true", () => {
            let ast = lexLogExp(tokenize("a eq 3 and a ge 3")) as any;
            expect(evaluateLogExp({ a: 3 }, ast)).to.equal(true)
        })
        it ("{ a: 3 } - a eq 3 and a ge 5 => false", () => {
            let ast = lexLogExp(tokenize("a eq 3 and a ge 5")) as any;
            expect(evaluateLogExp({ a: 3 }, ast)).to.equal(false)
        })
        it ("{ a: 3, b: 4 } - a eq 5 or b eq 4 => true", () => {
            let ast = lexLogExp(tokenize("a eq 5 or b eq 4")) as any;
            expect(evaluateLogExp({ a: 3, b: 4 }, ast)).to.equal(true)
        })
    })

    describe ("evaluatePath", () => {
        
        it ("{ a: 3 } - a => 3", () => {
            let ast = lexParamPath(tokenize("a")) as PathLexeme;
            expect(evaluatePath({ a: 3 }, ast)?.valueOf()).to.equal(3)
        })

        it ("{ a: { b: 2 } } - a.b => 2", () => {
            expect(evaluatePath(
                { a: { b: 2 } },
                lexParamPath(tokenize("a.b")) as PathLexeme
            )?.valueOf()).to.equal(2)
        })

        it ("{ a: { b: 2 } } - b.c => undefined", () => {
            expect(evaluatePath(
                { a: { b: 2 } },
                lexParamPath(tokenize("b.c")) as PathLexeme
            )?.valueOf()).to.equal(undefined)
        })

        it ("{ a: { b: 2, c: 3 } } - a[b eq 2].c => 3", () => {
            expect(evaluatePath(
                { a: { b: 2, c: 3 } },
                lexParamPath(tokenize("a[b eq 2].c")) as PathLexeme
            )?.valueOf()).to.equal(3)
        })

        it ("{ a: { b: 2, c: 3 } } - a[b eq 12].c => undefined", () => {
            expect(evaluatePath(
                { a: { b: 2, c: 3 } },
                lexParamPath(tokenize("a[b eq 12].c")) as PathLexeme
            )?.valueOf()).to.equal(undefined)
        })

        it ("{ a: { b: 2, c: 3 } } - a[b eq 2] => { b: 2, c: 3 }", () => {
            expect(evaluatePath(
                { a: { b: 2, c: 3 } },
                lexParamPath(tokenize("a[b eq 2]")) as PathLexeme
            )?.valueOf()).to.deep.equal({ b: 2, c: 3 })
        })

        it ("{ a: { b: 2, c: 3 } } - a[b eq 2 and c eq 3] => { b: 2, c: 3 }", () => {
            expect(evaluatePath(
                { a: { b: 2, c: 3 } },
                lexParamPath(tokenize("a[b eq 2 and c eq 3]")) as PathLexeme
            )?.valueOf()).to.deep.equal({ b: 2, c: 3 })
        })
    })

    describe("evaluateFilter", () => {
        it ('{ a: 3 } - "a eq 3" => { a: 3 }', () => {
            let ast = lexFilter(tokenize("a eq 3")) as any;
            expect(evaluateFilter({ a: 3 }, ast)).to.deep.equal({ a: 3 })
        })
        it ('{ a: 3 } - "a eq 5" => undefined', () => {
            let ast = lexFilter(tokenize("a eq 5")) as any;
            expect(evaluateFilter({ a: 3 }, ast)).to.equal(undefined)
        })
        it ('{ a: 3, b: 4 } - "a eq 3 and b ge 4" => { a: 3, b: 4 }', () => {
            let ast = lexFilter(tokenize("a eq 3 and b ge 4")) as any;
            expect(evaluateFilter({ a: 3, b: 4 }, ast)).to.deep.equal({ a: 3, b: 4 })
        })
        it ('{ a: 3 } - "(a eq 3)" => { a: 3 }', () => {
            let ast = lexFilter(tokenize("(a eq 3)")) as any;
            expect(evaluateFilter({ a: 3 }, ast)).to.deep.equal({ a: 3 })
        })
        it ('{ a: 3 } - "not(a eq 4)" => { a: 3 }', () => {
            let ast = lexFilter(tokenize("not(a eq 4)")) as any;
            expect(evaluateFilter({ a: 3 }, ast)).to.deep.equal({ a: 3 })
        })
        it ('{ a: 3 } - "not(a eq 3)" => undefined', () => {
            let ast = lexFilter(tokenize("not(a eq 3)")) as any;
            expect(evaluateFilter({ a: 3 }, ast)).to.equal(undefined)
        })
    });
})
