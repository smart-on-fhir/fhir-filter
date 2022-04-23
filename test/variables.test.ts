import { describe, it }         from "mocha"
import { expect }               from "chai"
import StringVariable           from "../src/dataTypes/String"
import NumberVariable           from "../src/dataTypes/Number"
import TokenVariable            from "../src/dataTypes/Token"
import DateVariable             from "../src/dataTypes/Date"
import QuantityVariable         from "../src/dataTypes/Quantity"
import { operatorExpression }   from "../src/evaluate"
import { COMPARISON_OPERATORS } from "../src/config"


describe("evaluate", () => {
    it ("string variables", () => {
        const a = new StringVariable("abc")
        expect(a.valueOf()).to.equal("abc")
        expect(a.toString()).to.equal("abc")
        expect(a.toJSON()).to.equal("abc")
    })

    it ("token variables", () => {
        const a = new TokenVariable("true")
        expect(a.valueOf()).to.equal("true")
        expect(a.toString()).to.equal("true")
        expect(a.toJSON()).to.equal("true")
    })

    it ("number variables", () => {
        const a = new NumberVariable(123)
        expect(a.valueOf()).to.equal(123)
        expect(a.toString()).to.equal("123")
        expect(a.toJSON()).to.equal(123)
    })

    it ("date variables", () => {
        const a = new DateVariable("2020-02-03")
        expect(a.valueOf()).to.be.instanceOf(Date)
        expect(a.toString()).to.equal(new Date("2020-02-03T00:00:00.001").toString())
        // expect(a.toJSON()).to.equal(new Date("2020-02-03T00:00:00.001"))
    })

    it ("quantity variables", () => {
        const a = new QuantityVariable("123mg")
        expect(a.valueOf()).to.equal(123)
        expect(a.toString()).to.equal("123mg")
        expect(a.toJSON()).to.deep.equal({ value: 123, unit: "mg" })
    })

    describe ("comparison expressions", () => {

        const cfg: [any, any, keyof typeof COMPARISON_OPERATORS, any, any, string?][] = [

            // STRINGS --------------------------------------------------------
            [ StringVariable, "abc", "eq", "abc", true ],
            [ StringVariable, "Abc", "eq", "abc", true ],
            [ StringVariable, "abc", "eq", "bcd", false],
            [ StringVariable, "Abc", "eq", "bcd", false],
            [ StringVariable, "abc", "eq", "abc", true ],
            [ StringVariable, "abc", "eq", "bcd", false],
            [ StringVariable, "Abc", "eq", "abc", true ],
            [ StringVariable, "Abc", "eq", "bcd", false],

            [ StringVariable, "abc", "ne", "abc", false],
            [ StringVariable, "abc", "ne", "bcd", true ],
            [ StringVariable, "Abc", "ne", "abc", false],
            [ StringVariable, "Abc", "ne", "bcd", true ],
            
            [ StringVariable, "bcd", "gt", "abc", true ],
            [ StringVariable, "abc", "gt", "abc", false],
            [ StringVariable, "Bcd", "gt", "abc", true ],
            [ StringVariable, "Abc", "gt", "abc", false],
            
            [ StringVariable, "bcd", "ge", "abc", true ],
            [ StringVariable, "bcd", "ge", "bcd", true ],
            [ StringVariable, "bcd", "ge", "cde", false],
            [ StringVariable, "Bcd", "ge", "abc", true ],
            [ StringVariable, "Bcd", "ge", "bcd", true ],
            [ StringVariable, "Bcd", "ge", "cde", false],
            
            [ StringVariable, "bcd", "lt", "abc", false],
            [ StringVariable, "abc", "lt", "bcd", true ],
            [ StringVariable, "Acd", "lt", "bcd", true ],
            [ StringVariable, "Abc", "lt", "abc", false],
            
            [ StringVariable, "bcd", "le", "abc", false],
            [ StringVariable, "bcd", "le", "bcd", true ],
            [ StringVariable, "bcd", "le", "cde", true ],
            [ StringVariable, "Bcd", "le", "abc", false],
            [ StringVariable, "Bcd", "le", "bcd", true ],
            [ StringVariable, "Bcd", "le", "cde", true ],

            [ StringVariable, "bcd", "co", "abc", false],
            [ StringVariable, "bcd", "co", "b"  , true ],
            [ StringVariable, "bcd", "co", "bc" , true ],
            [ StringVariable, "bcd", "co", "cd" , true ],
            [ StringVariable, "bcd", "co", "Abc", false],
            [ StringVariable, "bcd", "co", "B"  , true ],
            [ StringVariable, "bcd", "co", "Bc" , true ],
            [ StringVariable, "bcd", "co", "Cd" , true ],

            [ StringVariable, "bcd", "sw", "b"  , true ],
            [ StringVariable, "bcd", "sw", "bc" , true ],
            [ StringVariable, "bcd", "sw", "bcd", true ],
            [ StringVariable, "bcd", "sw", "cd" , false],
            [ StringVariable, "bcd", "sw", "B"  , true ],
            [ StringVariable, "bcd", "sw", "Bc" , true ],
            [ StringVariable, "bcd", "sw", "BcD", true ],
            [ StringVariable, "bcd", "sw", "Cd" , false],

            [ StringVariable, "bcd", "ew", "d"  , true ],
            [ StringVariable, "bcd", "ew", "cd" , true ],
            [ StringVariable, "bcd", "ew", "bcd", true ],
            [ StringVariable, "bcd", "ew", "bc" , false],
            [ StringVariable, "bcd", "ew", "D"  , true ],
            [ StringVariable, "bcd", "ew", "CD" , true ],
            [ StringVariable, "bcd", "ew", "BcD", true ],
            [ StringVariable, "bcd", "ew", "BC" , false],

            [ StringVariable, "a", "ap", "b", Error, 'Operator "ap" not supported for string variables' ],
            [ StringVariable, "a", "sa", "b", Error, 'Operator "sa" not supported for string variables' ],
            [ StringVariable, "a", "eb", "b", Error, 'Operator "eb" not supported for string variables' ],
            [ StringVariable, "a", "pr", "b", Error, 'Operator "pr" not supported for string variables' ],
            [ StringVariable, "a", "po", "b", Error, 'Operator "po" not supported for string variables' ],
            [ StringVariable, "a", "ss", "b", Error, 'Operator "ss" not supported for string variables' ],
            [ StringVariable, "a", "sb", "b", Error, 'Operator "sb" not supported for string variables' ],
            [ StringVariable, "a", "in", "b", Error, 'Operator "in" not supported for string variables' ],
            [ StringVariable, "a", "ni", "b", Error, 'Operator "ni" not supported for string variables' ],
            [ StringVariable, "a", "re", "b", Error, 'Operator "re" not supported for string variables' ],

            // NUMBERS --------------------------------------------------------
            [ NumberVariable, 123, "eq", 123, true  ],
            [ NumberVariable, 123, "eq", 234, false ],
            
            [ NumberVariable, 123, "ne", 234, true  ],
            [ NumberVariable, 123, "ne", 123, false ],
            
            [ NumberVariable, 123, "gt", 234, false ],
            [ NumberVariable, 123, "gt", 123, false ],
            [ NumberVariable, 234, "gt", 123, true  ],
            
            [ NumberVariable, 123, "ge", 234, false ],
            [ NumberVariable, 123, "ge", 123, true  ],
            [ NumberVariable, 234, "ge", 123, true  ],
            
            [ NumberVariable, 123, "lt", 123, false ],
            [ NumberVariable, 234, "lt", 123, false ],
            [ NumberVariable, 123, "lt", 234, true  ],
            
            [ NumberVariable, 123, "le", 234, true  ],
            [ NumberVariable, 123, "le", 123, true  ],
            [ NumberVariable, 234, "le", 123, false ],

            [ NumberVariable, 234, "co", 123, Error, 'Operator "co" not supported for number variables' ],

            [ NumberVariable, 234, "sw", 123, Error, 'Operator "sw" not supported for number variables' ],

            [ NumberVariable, 234, "ew", 123, Error, 'Operator "ew" not supported for number variables' ],

            // // "ap"
            // // "sa"
            // // "eb"
            // // "pr"
            // // "po"
            // // "ss"
            // // "sb"
            // // "in"
            // // "ni"
            // // "re"

            // TOKENS ---------------------------------------------------------
            [ TokenVariable, "true" , "eq", "TruE" , true ],
            [ TokenVariable, "FALse", "eq", "false", true ],
            [ TokenVariable, "Null" , "eq", "null" , true ],
            [ TokenVariable, "NaN"  , "ew", "word" , Error, 'Operator "ew" not supported for token variables' ],
            [ TokenVariable, "Null" , "ss", "null" , Error, 'Operator "ss" not implemented for tokens' ],
            [ TokenVariable, "Null" , "sb", "null" , Error, 'Operator "sb" not implemented for tokens' ],
            [ TokenVariable, "Null" , "in", "null" , Error, 'Operator "in" not implemented for tokens' ],


            // DATE -----------------------------------------------------------
            [ DateVariable, "2020-02-03"           , "eq", "2020-02-03"           , true  ],
            [ DateVariable, "2020-02-03"           , "eq", "2020-02-04"           , false ],
            [ DateVariable, "2020-02-03"           , "eq", "2020-03-03"           , false ],
            [ DateVariable, "2020-02-03"           , "eq", "2021-02-03"           , false ],
            [ DateVariable, "2020-02-03T00:00:00Z" , "eq", "2020-02-03T00:00:00Z" , true  ],
            [ DateVariable, "2020-02-03T00:00:00Z" , "eq", "2020-02-03T00:00:01Z" , false ],
            [ DateVariable, "2020-02-03T00:00:00Z" , "eq", "2020-02-03T00:01:00Z" , false ],
            [ DateVariable, "2020-02-03T00:00:00Z" , "eq", "2020-02-03T01:00:00Z" , false ],
            [ DateVariable, "2020-02-03T08:00:00Z" , "eq", "2020-02-03"           , true  ],
            [ DateVariable, "2020-02-03T08:05:03Z" , "eq", "2020-02-03"           , true  ],
            [ DateVariable, "2020-02-03T08:05:03Z" , "eq", "2020-02"              , true  ],
            [ DateVariable, "2020-02-03T08:05:03Z" , "eq", "2020"                 , true  ],

            [ DateVariable, "2020-02-03T08:05:03Z" , "co", "2020-02-03T08:05:03Z" , true  ],
            [ DateVariable, "2020-02-03"           , "co", "2020-02-03T08:05:03Z" , true  ],
            [ DateVariable, "2020-02"              , "co", "2020-02-03T08:05:03Z" , true  ],
            [ DateVariable, "2020"                 , "co", "2020-02-03T08:05:03Z" , true  ],

            [ DateVariable, "2020-02-03T00:00:00Z" , "gt", "2020-02-02T00:00:00Z" , true  ],
            [ DateVariable, "2020-02-03T00:00:00Z" , "gt", "2020-05-02T00:00:00Z" , false ],
            [ DateVariable, "2020-02-03"           , "gt", "2020-02-02"           , true  ],
            [ DateVariable, "2020-02-03"           , "gt", "2020-05-02"           , false ],
            [ DateVariable, "2020-03"              , "gt", "2020-02"              , true  ],
            [ DateVariable, "2020-03"              , "gt", "2020-05"              , false ],
            [ DateVariable, "2021"                 , "gt", "2020"                 , true  ],
            [ DateVariable, "2020"                 , "gt", "2025"                 , false ],

            [ DateVariable, "2020-02-03T00:00:00Z" , "ge", "2020-02-02T00:00:00Z" , true  ],
            [ DateVariable, "2020-02-03T00:00:00Z" , "ge", "2020-02-03T00:00:00Z" , true  ],
            [ DateVariable, "2020-02-03"           , "ge", "2020-02-02"           , true  ],
            [ DateVariable, "2020-02-03"           , "ge", "2020-02-03"           , true  ],
            [ DateVariable, "2020-02"              , "ge", "2020-01"              , true  ],
            [ DateVariable, "2020-02"              , "ge", "2020-02"              , true  ],
            [ DateVariable, "2021"                 , "ge", "2020"                 , true  ],
            [ DateVariable, "2020"                 , "ge", "2020"                 , true  ],
            [ DateVariable, "2020"                 , "ge", "2021"                 , false ],
            [ DateVariable, "2020-02"              , "ge", "2020-03"              , false ],
            [ DateVariable, "2020-02-03"           , "ge", "2020-02-04"           , false ],
            [ DateVariable, "2020-02-03T00:00:00Z" , "ge", "2020-02-04T00:00:00Z" , false ],

            [ DateVariable, "2020-02-03T00:00:00Z" , "lt", "2020-02-02T00:00:00Z" , false ],
            [ DateVariable, "2020-02-03T00:00:00Z" , "lt", "2020-05-02T00:00:00Z" , true  ],
            [ DateVariable, "2020-02-03"           , "lt", "2020-02-02"           , false ],
            [ DateVariable, "2020-02-03"           , "lt", "2020-05-02"           , true  ],
            [ DateVariable, "2020-03"              , "lt", "2020-02"              , false ],
            [ DateVariable, "2020-03"              , "lt", "2020-05"              , true  ],
            [ DateVariable, "2021"                 , "lt", "2020"                 , false ],
            [ DateVariable, "2020"                 , "lt", "2025"                 , true  ],

            [ DateVariable, "2020-02-03T00:00:00Z" , "le", "2020-02-02T00:00:00Z" , false ],
            [ DateVariable, "2020-02-03T00:00:00Z" , "le", "2020-05-03T00:00:00Z" , true  ],
            [ DateVariable, "2020-02-03"           , "le", "2020-02-03"           , true  ],
            [ DateVariable, "2020-02-03"           , "le", "2020-05-02"           , true  ],
            [ DateVariable, "2020-03"              , "le", "2020-03"              , true  ],
            [ DateVariable, "2020-03"              , "le", "2020-05"              , true  ],
            [ DateVariable, "2021"                 , "le", "2021"                 , true  ],
            [ DateVariable, "2020"                 , "le", "2025"                 , true  ],

            [ DateVariable, "2020-02-02T00:00:00Z" , "po", "2020-02-02T00:00:00Z" , true  ],
            [ DateVariable, "2020-02-02"           , "po", "2020-02-02"           , true  ],
            [ DateVariable, "2020-02"              , "po", "2020-02-02"           , true  ],
            [ DateVariable, "2020"                 , "po", "2020-02-02"           , true  ],
            [ DateVariable, "2020-02-02"           , "po", "2020-02-02"           , true  ],
            [ DateVariable, "2020-02-02"           , "po", "2020-02"              , true  ],
            [ DateVariable, "2020-02-02"           , "po", "2020"                 , true  ],
            [ DateVariable, "2020-02-02"           , "po", "2020-02-03"           , false ],
            [ DateVariable, "2020-02"              , "po", "2020-03"              , false ],
            [ DateVariable, "2020"                 , "po", "2021"                 , false ],
            [ DateVariable, "2020-02-03T00:00:00Z" , "po", "2020-02-02T00:00:00Z" , false ],
            [ DateVariable, "2020"                 , "re", "2021"                 , Error, 'Operator "re" not supported for dates' ],

            // -----------------------------------------------------------------------------
            [ QuantityVariable, "100mg", "eq", "100mg", true  ],
            [ QuantityVariable, "100mg", "eq", "120mg", false ],
            [ QuantityVariable, "100mg", "eq", "100kg", Error, "Cannot compare quantities with different units" ],

            [ QuantityVariable, "100mg", "ne", "100mg", false ],
            [ QuantityVariable, "100mg", "ne", "120mg", true  ],
            [ QuantityVariable, "100mg", "ne", "100kg", Error, "Cannot compare quantities with different units" ],

            [ QuantityVariable, "100mg", "gt", "100mg", false ],
            [ QuantityVariable, "130mg", "gt", "120mg", true  ],
            [ QuantityVariable, "130mg", "gt", "100kg", Error, "Cannot compare quantities with different units" ],

            [ QuantityVariable, "100mg", "ge", "100mg", true  ],
            [ QuantityVariable, "130mg", "ge", "120mg", true  ],
            [ QuantityVariable, "130mg", "ge", "100kg", Error, "Cannot compare quantities with different units" ],
            [ QuantityVariable, "130mg", "ge", "160mg", false ],

            [ QuantityVariable, "100mg", "lt", "100mg", false ],
            [ QuantityVariable, "110mg", "lt", "120mg", true  ],
            [ QuantityVariable, "130mg", "lt", "100kg", Error, "Cannot compare quantities with different units" ],

            [ QuantityVariable, "100mg", "le", "100mg", true  ],
            [ QuantityVariable, "110mg", "le", "120mg", true  ],
            [ QuantityVariable, "130mg", "le", "100kg", Error, "Cannot compare quantities with different units"  ],
            [ QuantityVariable, "180mg", "le", "160mg", false ],
            
            [ QuantityVariable, "180mg", "ss", "160mg", Error, 'Operator "ss" not supported for quantity variables' ],
            
        ];
        
        cfg.forEach(([ctor, left, operator, right, expected, message]) => {
            it (`(${JSON.stringify(left)} ${operator} ${JSON.stringify(right)}) => ${expected === Error ? "throws" + (message ? " " + JSON.stringify(message) : "") : expected}`, () => {

                if (expected === Error) {
                    const fn = function() { return operatorExpression(new ctor(left), operator, new ctor(right)); };
                    expect(fn).to.throw(message)
                } else {
                    expect(operatorExpression(new ctor(left), operator, new ctor(right))).to.equal(expected)
                }
            })
        });
    })
})