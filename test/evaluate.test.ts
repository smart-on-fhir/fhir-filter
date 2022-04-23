import { describe, it } from "mocha"
import { expect }       from "chai"
import { tokenize }     from "../src/tokenizer"
import StringVariable   from "../src/dataTypes/String"
import NumberVariable   from "../src/dataTypes/Number"
import DateVariable     from "../src/dataTypes/Date"
import TokenVariable    from "../src/dataTypes/Token"
import QuantityVariable from "../src/dataTypes/Quantity"
import * as evaluate    from "../src/evaluate"
import * as lex         from "../src/lexer"


describe("evaluate", () => {

    describe("evaluateIdentifier", () => {
        it ("works", () => {
            expect(evaluate.identifier({}, "a")).to.equal(undefined)
            expect(evaluate.identifier({ a: 2 }, "a")?.valueOf()).to.equal(2)
            expect(evaluate.identifier({ a: 2 }, "b")).to.equal(undefined)
        })
    })

    describe("evaluateCompValue", () => {
        it ("works with strings", () => {
            let ast = lex.compValue(tokenize('"a"'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(StringVariable)
            expect(out?.valueOf()).to.equal("a")
        })
        it ("works with integers", () => {
            let ast = lex.compValue(tokenize('5'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(NumberVariable)
            expect(out?.valueOf()).to.equal(5)
        })
        it ("works with negative integers", () => {
            let ast = lex.compValue(tokenize('-5'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(NumberVariable)
            expect(out?.valueOf()).to.equal(-5)
        })
        it ("works with floats", () => {
            let ast = lex.compValue(tokenize('5.3'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(NumberVariable)
            expect(out?.valueOf()).to.equal(5.3)
        })
        it ("works with negative floats", () => {
            let ast = lex.compValue(tokenize('-5.6'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(NumberVariable)
            expect(out?.valueOf()).to.equal(-5.6)
        })
        it ("works with YYYY-MM dates", () => {
            let ast = lex.compValue(tokenize('2020-05'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(DateVariable)
        })
        it ("works with YYYY-MM-DD dates", () => {
            let ast = lex.compValue(tokenize('2020-05-22'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(DateVariable)
        })
        it ("works with datetime", () => {
            let ast = lex.compValue(tokenize('2020-05-22T10:12:22.1234Z'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(DateVariable)
        })
        it ("works with 'true' tokens", () => {
            let ast = lex.compValue(tokenize('true'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(TokenVariable)
            expect(out?.valueOf()).to.equal("true")
        })
        it ("works with 'false' tokens", () => {
            let ast = lex.compValue(tokenize('false'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(TokenVariable)
            expect(out?.valueOf()).to.equal("false")
        })
        it ("works with 'null' tokens", () => {
            let ast = lex.compValue(tokenize('null'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(TokenVariable)
            expect(out?.valueOf()).to.equal("null")
        })
        it ("works with quantity", () => {
            let ast = lex.compValue(tokenize('100mg'));
            let out = evaluate.compValue(ast);
            expect(out).to.be.instanceOf(QuantityVariable)
            expect((out as QuantityVariable).valueOf()).to.equal(100)
            expect((out as QuantityVariable).unit).to.equal("mg")
        })
    });

    describe("evaluateParamExp", () => {
        it ("{ a: 3 } - a eq 3 => true", () => {
            let ast = lex.paramExp(tokenize("a eq 3"));
            expect(evaluate.paramExp({ a: 3 }, ast as any)).to.equal(true)
        })
        it ("{ a: 3 } - a gt 3 => false", () => {
            let ast = lex.paramExp(tokenize("a gt 3"));
            expect(evaluate.paramExp({ a: 3 }, ast as any)).to.equal(false)
        })
        it ("{ a: 3 } - a gt 3 or b eq 6 => false", () => {
            let tokens = tokenize("a gt 3 or b eq 6")
            let ast = lex.paramExp(tokens);
            expect(evaluate.paramExp({ a: 3 }, ast as any)).to.equal(false)
        })
        it ("compare string and tokens", () => {
            expect(evaluate.paramExp({ a: "true" }, lex.paramExp(tokenize("a eq true")) as any)).to.equal(true)
            expect(evaluate.paramExp({ a: "true" }, lex.paramExp(tokenize("a eq false")) as any)).to.equal(false)
        })
        it ("compare string and quantity", () => {
            expect(evaluate.paramExp({ a: "100g" }, lex.paramExp(tokenize("a eq 100g")) as any)).to.equal(true)
            expect(evaluate.paramExp({ a: "100g" }, lex.paramExp(tokenize("a eq 110g")) as any)).to.equal(false)
        })
        it ("compare string and numbers", () => {
            expect(evaluate.paramExp({ a: "100" }, lex.paramExp(tokenize("a eq 100")) as any)).to.equal(true)
            expect(evaluate.paramExp({ a: "100" }, lex.paramExp(tokenize("a eq 110")) as any)).to.equal(false)
        })
        it ("compare numbers and string", () => {
            expect(evaluate.paramExp({ a: 100 }, lex.paramExp(tokenize('a eq "100"')) as any)).to.equal(true)
            expect(evaluate.paramExp({ a: 100 }, lex.paramExp(tokenize('a eq "110"')) as any)).to.equal(false)
        })
        it ("compare numbers and quantity", () => {
            expect(evaluate.paramExp({ a: 100 }, lex.paramExp(tokenize('a eq 100g')) as any)).to.equal(false)
            expect(evaluate.paramExp({ a: 100 }, lex.paramExp(tokenize('a eq 110g')) as any)).to.equal(false)
        })
    })

    describe("evaluateLogExp", () => {
        it ("{ a: 3 } - a eq 5 or a ge 4 => false", () => {
            let ast = lex.logExp(tokenize("a eq 5 or a ge 4")) as any;
            expect(evaluate.logExp({ a: 3 }, ast)).to.equal(false)
        })
        it ("{ a: 3 } - a eq 5 or a ge 3 => true", () => {
            let ast = lex.logExp(tokenize("a eq 3 and a ge 3")) as any;
            expect(evaluate.logExp({ a: 3 }, ast)).to.equal(true)
        })
        it ("{ a: 3 } - a eq 3 and a ge 3 => true", () => {
            let ast = lex.logExp(tokenize("a eq 3 and a ge 3")) as any;
            expect(evaluate.logExp({ a: 3 }, ast)).to.equal(true)
        })
        it ("{ a: 3 } - a eq 3 and a ge 5 => false", () => {
            let ast = lex.logExp(tokenize("a eq 3 and a ge 5")) as any;
            expect(evaluate.logExp({ a: 3 }, ast)).to.equal(false)
        })
        it ("{ a: 3, b: 4 } - a eq 5 or b eq 4 => true", () => {
            let ast = lex.logExp(tokenize("a eq 5 or b eq 4")) as any;
            expect(evaluate.logExp({ a: 3, b: 4 }, ast)).to.equal(true)
        })
    })

    describe ("evaluatePath", () => {
        
        it ("{ a: 3 } - a => 3", () => {
            let ast = lex.paramPath(tokenize("a"));
            expect(evaluate.path({ a: 3 }, ast)?.valueOf()).to.equal(3)
        })

        it ("{ a: { b: 2 } } - a.b => 2", () => {
            expect(evaluate.path(
                { a: { b: 2 } },
                lex.paramPath(tokenize("a.b"))
            )?.valueOf()).to.equal(2)
        })

        it ("{ a: { b: 2 } } - b.c => undefined", () => {
            expect(evaluate.path(
                { a: { b: 2 } },
                lex.paramPath(tokenize("b.c"))
            )?.valueOf()).to.equal(undefined)
        })

        it ("{ a: { b: 2, c: 3 } } - a[b eq 2].c => 3", () => {
            expect(evaluate.path(
                { a: { b: 2, c: 3 } },
                lex.paramPath(tokenize("a[b eq 2].c"))
            )?.valueOf()).to.equal(3)
        })

        it ("{ a: { b: 2, c: 3 } } - a[b eq 12].c => undefined", () => {
            expect(evaluate.path(
                { a: { b: 2, c: 3 } },
                lex.paramPath(tokenize("a[b eq 12].c"))
            )?.valueOf()).to.equal(undefined)
        })

        it ("{ a: { b: 2, c: 3 } } - a[b eq 2] => { b: 2, c: 3 }", () => {
            expect(evaluate.path(
                { a: { b: 2, c: 3 } },
                lex.paramPath(tokenize("a[b eq 2]"))
            )?.valueOf()).to.deep.equal({ b: 2, c: 3 })
        })

        it ("{ a: { b: 2, c: 3 } } - a[b eq 2 and c eq 3] => { b: 2, c: 3 }", () => {
            expect(evaluate.path(
                { a: { b: 2, c: 3 } },
                lex.paramPath(tokenize("a[b eq 2 and c eq 3]"))
            )?.valueOf()).to.deep.equal({ b: 2, c: 3 })
        })
    })

    describe("evaluateFilter", () => {
        it ('{ a: 3 } - "a eq 3" => { a: 3 }', () => {
            let ast = lex.filter(tokenize("a eq 3")) as any;
            expect(evaluate.filter({ a: 3 }, ast)).to.deep.equal({ a: 3 })
        })
        it ('{ a: 3 } - "a eq 5" => undefined', () => {
            let ast = lex.filter(tokenize("a eq 5")) as any;
            expect(evaluate.filter({ a: 3 }, ast)).to.equal(undefined)
        })
        it ('{ a: 3, b: 4 } - "a eq 3 and b ge 4" => { a: 3, b: 4 }', () => {
            let ast = lex.filter(tokenize("a eq 3 and b ge 4")) as any;
            expect(evaluate.filter({ a: 3, b: 4 }, ast)).to.deep.equal({ a: 3, b: 4 })
        })
        it ('{ a: 3 } - "(a eq 3)" => { a: 3 }', () => {
            let ast = lex.filter(tokenize("(a eq 3)")) as any;
            expect(evaluate.filter({ a: 3 }, ast)).to.deep.equal({ a: 3 })
        })
        it ('{ a: 3 } - "not(a eq 4)" => { a: 3 }', () => {
            let ast = lex.filter(tokenize("not(a eq 4)")) as any;
            expect(evaluate.filter({ a: 3 }, ast)).to.deep.equal({ a: 3 })
        })
        it ('{ a: 3 } - "not(a eq 3)" => undefined', () => {
            let ast = lex.filter(tokenize("not(a eq 3)")) as any;
            expect(evaluate.filter({ a: 3 }, ast)).to.equal(undefined)
        })
    });
})
