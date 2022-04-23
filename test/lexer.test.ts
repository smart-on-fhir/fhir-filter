import { describe, it } from "mocha"
import { expect }       from "chai"
import { tokenize }     from "../src/tokenizer"
import {
    isCompValue, isSequence, isParamExp, isFilter,
    is, isType, hasContent, isParamPath, isLogExp,
    compValue, paramExp, filter, logExp, paramPath
} from "../src/lexer"


describe("lexer", () => {

    describe("Matchers", () => {
        describe("is", () => {
            it ("by type", () => {
                expect(is({ type: "boolean", content: "true", start: 0, end: 0 }, { type: "boolean" })).to.equal(true )
                expect(is({ type: "date"   , content: "true", start: 0, end: 0 }, { type: "boolean" })).to.equal(false)
            })
            it ("by content", () => {
                expect(is({ type: "date", content: "true", start: 0, end: 0 }, { content: "true"     })).to.equal(true )
                expect(is({ type: "date", content: "true", start: 0, end: 0 }, { content: "whatever" })).to.equal(false)
            })
            it ("by type and content", () => {
                expect(is({ type: "boolean", content: "true", start: 0, end: 0 }, { type: "boolean", content: "true"  })).to.equal(true )
                expect(is({ type: "boolean", content: "true", start: 0, end: 0 }, { type: "boolean", content: "false" })).to.equal(false)
                expect(is({ type: "boolean", content: "true", start: 0, end: 0 }, { type: "date"   , content: "true"  })).to.equal(false)
                expect(is({ type: "boolean", content: "true", start: 0, end: 0 }, { type: "string" , content: "false" })).to.equal(false)
            })
        })

        it ("isType", () => {
            expect(isType({ type: "boolean", content: "true", start: 0, end: 0 }, "boolean")).to.equal(true )
            expect(isType({ type: "date"   , content: "true", start: 0, end: 0 }, "boolean")).to.equal(false)
        })

        it ("hasContent", () => {
            expect(hasContent({ type: "date", content: "true", start: 0, end: 0 }, "true"    )).to.equal(true )
            expect(hasContent({ type: "date", content: "true", start: 0, end: 0 }, "whatever")).to.equal(false)
        })

        describe ("isCompValue", () => {
            it ("string", () => {
                expect(isCompValue(tokenize('"abc"'))).to.equal(1)
            })
            it ("number", () => {
                expect(isCompValue(tokenize('123'))).to.equal(1)
            })
            it ("boolean", () => {
                expect(isCompValue(tokenize('true'))).to.equal(1)
                expect(isCompValue(tokenize('false'))).to.equal(1) 
            })
            it ("date", () => {
                expect(isCompValue(tokenize('2020-01-02'))).to.equal(1)
            })
            it ("null", () => {
                expect(isCompValue(tokenize('null'))).to.equal(1)
            })
        })

        describe("isSequence", () => {
            it ("isSequence('', [])"                                                                     , () => { expect(isSequence(tokenize(""), [])).to.equal(0) });
            it ("isSequence('', ['a'])"                                                                  , () => { expect(isSequence(tokenize(""), ['a'])).to.equal(0) });
            it ("isSequence('a', ['a'])"                                                                 , () => { expect(isSequence(tokenize("a"), ["a"])).to.equal(1) });
            it ("isSequence('a', [{ type: 'identifier' }])"                                              , () => { expect(isSequence(tokenize("a"), [{ type: "identifier" }])).to.equal(1) });
            it ("isSequence('a b', ['a', 'b'])"                                                          , () => { expect(isSequence(tokenize("a b"), ["a", "b"])).to.equal(2) });
            it ("isSequence('a b c', ['a', 'b', 'c'])"                                                   , () => { expect(isSequence(tokenize("a b c"), ["a", "b", "c"])).to.equal(3) });
            it ("isSequence('a b c d', ['a', 'b', 'c', 'd'])"                                            , () => { expect(isSequence(tokenize("a b c d"), ["a", "b", "c", "d"])).to.equal(4) });
            it ("isSequence('a b', ['a', { type: 'identifier' }])"                                       , () => { expect(isSequence(tokenize("a b"), ["a", { type: 'identifier' }])).to.equal(2) });
            it ("isSequence('a b', ['a', { type: 'identifier', content: 'b' }])"                         , () => { expect(isSequence(tokenize("a b"), ["a", { type: 'identifier', content: 'b' }])).to.equal(2) });
            it ("isSequence('a[b eq c].d', ['a', '[', 'b', 'eq', 'c', ']', '.', 'd'])"                   , () => { expect(isSequence(tokenize("a[b eq c].d"), ['a', '[', 'b', 'eq', 'c', ']', '.', 'd'])).to.equal(8) });
            it ("isSequence('a[b eq c].d', ['a', { type: 'punctoator' }, 'b', 'eq', 'c', ']', '.', 'd'])", () => { expect(isSequence(tokenize("a[b eq c].d"), ['a', { type: 'punctoator' }, 'b', 'eq', 'c', ']', '.', 'd'])).to.equal(8) });
            it ("isSequence('a.b', [isParamPath])"                                                       , () => { expect(isSequence(tokenize("a.b"), [isParamPath])).to.equal(3) });
            it ("isSequence('a.b c', [isParamPath, 'c'])"                                                , () => { expect(isSequence(tokenize("a.b c"), [isParamPath, 'c'])).to.equal(4) });
            it ("isSequence('a.b c d', [isParamPath, 'c', 'd'])"                                         , () => { expect(isSequence(tokenize("a.b c d"), [isParamPath, 'c', 'd'])).to.equal(5) });
            it ("isSequence('a.b c.d e f', [isParamPath, isParamPath, 'e', 'f'])"                        , () => { expect(isSequence(tokenize("a.b c.d e f"), [isParamPath, isParamPath, 'e', 'f'])).to.equal(8) });
            it ("isSequence('c a.b', ['c', isParamPath])"                                                , () => { expect(isSequence(tokenize("c a.b"), ['c', isParamPath])).to.equal(4) });
            it ("isSequence('c a.b d', ['c', isParamPath, 'd'])"                                         , () => { expect(isSequence(tokenize("c a.b d"), ['c', isParamPath, 'd'])).to.equal(5) });
            it ("isSequence('a.b c d', [isParamPath, 'c', 'd'])"                                         , () => { expect(isSequence(tokenize("a.b c d"), [isParamPath, 'c', 'd'])).to.equal(5) });
            it ("isSequence('a.b eq', [isParamPath, 'eq'])"                                              , () => { expect(isSequence(tokenize("a.b eq"), [isParamPath, 'eq'])).to.equal(4) });
            it ("isSequence('a.b eq 5', [isParamPath, 'eq', '5'])"                                       , () => { expect(isSequence(tokenize("a.b eq 5"), [isParamPath, 'eq', '5'])).to.equal(5) });
            it ("isSequence('a.b eq 6', [isParamPath, 'eq', '6'])"                                       , () => { expect(isSequence(tokenize("a.b eq 6"), [isParamPath, 'eq', '6'])).to.equal(5) });
            it ("isSequence('a.b eq d', [isParamPath, 'eq', 'c'])"                                       , () => { expect(isSequence(tokenize("a.b eq d"), [isParamPath, 'eq', 'c'])).to.equal(0) });
            it ("isSequence('a eq 5', [isParamExp])"                                                     , () => { expect(isSequence(tokenize("a eq 5"), [isParamExp])).to.equal(3) });
            it ("isSequence('[a eq 5]', ['[', isParamExp, ']'])"                                         , () => { expect(isSequence(tokenize("[a eq 5]"), ['[', isParamExp, ']'])).to.equal(5) });
            it ("isSequence('5', [{ type: 'identifier' }])"                                              , () => { expect(isSequence(tokenize("5"), [{ type: "identifier" }])).to.equal(0) });
        })

        describe("isParamPath", () => {
            it ('a', () => {
                expect(isParamPath(tokenize("a"))).to.equal(1)
            })
            it ('a.b', () => {
                expect(isParamPath(tokenize("a.b"))).to.equal(3)
            })
            it ('a.b.c', () => {
                expect(isParamPath(tokenize("a.b.c"))).to.equal(5)
            })
            it ('a.b.c eq d', () => {
                expect(isParamPath(tokenize("a.b.c eq d"))).to.equal(5)
            })
            it ('a[b eq 6]', () => {
                expect(isParamPath(tokenize("a[b eq 6]"))).to.equal(6)
            })
            it ('a[b eq 6].b.c', () => {
                expect(isParamPath(tokenize("a[b eq 6].b.c"))).to.equal(10)
            })
        })

        describe("isParamExp", () => {
            [
                [ "a"          , 0 ],
                [ "a eq 5"     , 3 ],
                [ 'a eq "test"', 3 ],
                [ "a eq true"  , 3 ],
                [ "a eq false" , 3 ],
                [ "a eq null"  , 3 ],
                [ "a eq b"     , 0 ],
                [ "a eq ."     , 0 ],
                [ "a eq ["     , 0 ],

            ].forEach(([input, pos]) => {
                it (`${JSON.stringify(input)} => ${pos}`, () => {
                    expect(isParamExp(tokenize(input + ""), true)).to.equal(pos)
                })
            });

            // a eq 5 and b eq 6
            // (a eq 5) and b eq 6
            // a eq 5 and (b eq 6)
            // (a eq 5) and (b eq 6)
            // ((a eq 5) and (b eq 6))
        })

        describe("isLogExp", () => {
            // logExp = filter ("and" | "or" filter)+
            [
                [ "a eq 5"                       , 0  ],
                [ "a eq 5 and b gt 3"            , 7  ],
                [ "(a eq 5) and b gt 3"          , 9  ],
                [ "a eq 5 and (b gt 3)"          , 9  ],
                [ "(a eq 5) and (b gt 3)"        , 11 ],
                [ "((a eq 5) and (b gt 3))"      , 0  ],
                [ "a eq 5 and b gt 3 or x lt 4"  , 11 ],
                [ "a eq 5 and b gt 3 or (x lt 4)", 13 ],
            
            ].forEach(([input, pos]) => {
                it (`${JSON.stringify(input)} => ${pos}`, () => {
                    expect(isLogExp(tokenize(input + ""))).to.equal(pos)
                })
            });
        })

        describe("isFilter", () => {
            // filter = paramExp / logExp / ("not") "(" filter ")"
            [
                [ "a eq 5"                      , 3  ],
                [ "(a eq 5)"                    , 5  ],
                [ "not(a eq 5)"                 , 6  ],
                [ "a.b eq 5"                    , 5  ],
                [ "a.b[c ne 4].x eq 5"          , 12 ],
                [ "a eq 5 and b eq 2"           , 7  ],
                [ "a eq 5 and (b eq 2)"         , 9  ],
                [ "a eq 5 and b eq 2 or x gt 4" , 11 ],
                [ "(a eq 5) and b eq 2"         , 9  ],
                [ "(a eq 5) and (b eq 2)"       , 11 ],
            
            ].forEach(([input, pos]) => {
                it (`${JSON.stringify(input)} => ${pos}`, () => {
                    expect(isFilter(tokenize(input + ""), true)).to.equal(pos)
                })
            });
        })
    })

    describe("Lexers", () => {
        
        describe ("compValue", () => {
            it ("works with strings", () => {
                let tokens = tokenize('"aeq5"');
                expect(compValue(tokens)!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "string",
                        content: '"aeq5"',
                        start: 0,
                        end: 6
                    }
                });
                expect(tokens.length).to.equal(0)

                tokens = tokenize('"a eq 5"');
                expect(compValue(tokens)!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "string",
                        content: '"a eq 5"',
                        start: 0,
                        end: 8
                    }
                })
                expect(tokens.length).to.equal(0)

                tokens = tokenize('"a\\5"');
                expect(compValue(tokens)!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "string",
                        content: '"a\\5"',
                        start: 0,
                        end: 5
                    }
                })
                expect(tokens.length).to.equal(0)

                tokens = tokenize('"a\\""')
                expect(compValue(tokens)!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "string",
                        content: '"a\\""',
                        start: 0,
                        end: 5
                    }
                })
                expect(tokens.length).to.equal(0)
            })

            it ("works with numbers", () => {
                expect(compValue(tokenize('5'))!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "number",
                        content: '5',
                        start: 0,
                        end: 1
                    }
                })

                expect(compValue(tokenize('-5'))!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "number",
                        content: '-5',
                        start: 0,
                        end: 2
                    }
                })

                expect(compValue(tokenize('5.6'))!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "number",
                        content: '5.6',
                        start: 0,
                        end: 3
                    }
                })

                expect(compValue(tokenize('-5.6'))!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "number",
                        content: '-5.6',
                        start: 0,
                        end: 4
                    }
                })
            })

            it ("works with dates", () => {
                expect(compValue(tokenize('2020-01'))!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "date",
                        content: '2020-01',
                        start: 0,
                        end: 7
                    }
                })

                expect(compValue(tokenize('2020-01-05'))!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "date",
                        content: '2020-01-05',
                        start: 0,
                        end: 10
                    }
                })

                expect(compValue(tokenize('2020-01-05T12:50:00Z'))!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "date",
                        content: '2020-01-05T12:50:00Z',
                        start: 0,
                        end: 20
                    }
                })
            })

            it ("works with tokens", () => {
                expect(compValue(tokenize('true'))!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "token",
                        content: 'true',
                        start: 0,
                        end: 4
                    }
                })

                expect(compValue(tokenize('false'))!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "token",
                        content: 'false',
                        start: 0,
                        end: 5
                    }
                })

                expect(compValue(tokenize('null'))!).to.deep.equal({
                    type: "compValue",
                    content: {
                        type: "token",
                        content: 'null',
                        start: 0,
                        end: 4
                    }
                })
            })
        })

        describe("lexParamPath", () => {
            it ("a", () => {
                let tokens = tokenize('a');
                expect(paramPath(tokens)).to.deep.equal({
                    type: "paramPath",
                    content: [{
                        type: "identifier",
                        content: 'a',
                        start: 0,
                        end: 1
                    }]
                })
                expect(tokens.length).to.equal(0)
            })
            
            it ("a.b", () => {
                let tokens = tokenize('a.b');
                expect(paramPath(tokens)).to.deep.equal({
                    type: "paramPath",
                    content: [{
                        type: "identifier",
                        content: 'a',
                        start: 0,
                        end: 1
                    },
                    {
                        type: "identifier",
                        content: 'b',
                        start: 2,
                        end: 3
                    }]
                })
                expect(tokens.length).to.equal(0)
            })

            it ("a.b.c", () => {
                let tokens = tokenize('a.b.c')
                expect(paramPath(tokens)).to.deep.equal({
                    type: "paramPath",
                    content: [{
                        type: "identifier",
                        content: 'a',
                        start: 0,
                        end: 1
                    },
                    {
                        type: "identifier",
                        content: 'b',
                        start: 2,
                        end: 3
                    },
                    {
                        type: "identifier",
                        content: 'c',
                        start: 4,
                        end: 5
                    }]
                })
                expect(tokens.length).to.equal(0)
            })

            it ("a[b eq 6].c", () => {
                let tokens = tokenize('a[b eq 6].c')
                expect(paramPath(tokens)).to.deep.equal({
                    type: "paramPath",
                    content: [
                        {
                            content: 'a',
                            end: 1,
                            start: 0,
                            type: "identifier",
                        },
                        {
                            type: "filter",
                            content: [
                                {
                                    type: "paramExp",
                                    content: [
                                        {
                                            type: "paramPath",
                                            content: [
                                                {
                                                    type: "identifier",
                                                    content: 'b',
                                                    start: 2,
                                                    end: 3
                                                }
                                            ]
                                        },
                                        {
                                            type: "operator",
                                            content: "eq",
                                            start: 4,
                                            end: 6
                                        },
                                        {
                                            type: "compValue",
                                            content: {
                                                type: "number",
                                                content: "6",
                                                start: 7,
                                                end: 8
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "identifier",
                            content: 'c',
                            start: 10,
                            end: 11
                        }
                    ]
                })
                expect(tokens.length).to.equal(0)
            })
        })

        describe("lexParamExp", () => {

            it ("a eq 5", () => {
                let tokens = tokenize('a eq 5');
                expect(paramExp(tokens)).to.deep.equal({
                    type: "paramExp",
                    content: [{
                        type: "paramPath",
                        content: [{
                            type: "identifier",
                            content: 'a',
                            start: 0,
                            end: 1
                        }]
                    },
                    {
                        type: "operator",
                        content: 'eq',
                        start: 2,
                        end: 4
                    },
                    {
                        type: "compValue",
                        content: {
                            type: "number",
                            content: '5',
                            start: 5,
                            end: 6
                        }
                    }]
                })
                expect(tokens.length).to.equal(0)
            })

            it ("a.b ne 7", () => {
                let tokens = tokenize('a.b ne 7')
                expect(paramExp(tokens)).to.deep.equal({
                    type: "paramExp",
                    content: [{
                        type: "paramPath",
                        content: [{
                            type: "identifier",
                            content: 'a',
                            start: 0,
                            end: 1
                        },{
                            type: "identifier",
                            content: 'b',
                            start: 2,
                            end: 3
                        }]
                    },
                    {
                        type: "operator",
                        content: 'ne',
                        start: 4,
                        end: 6
                    },
                    {
                        type: "compValue",
                        content: {
                            type: "number",
                            content: '7',
                            start: 7,
                            end: 8
                        }
                    }]
                })
                expect(tokens.length).to.equal(0)
            })
        })

        describe("lexLogExp", () => {
            it ("a eq 5 and b gt 6", () => {
                let tokens = tokenize('a eq 5 and b gt 6');
                expect(logExp(tokens)).to.deep.equal({
                    type: "logExp",
                    content: [
                        {
                            type: "filter",
                            content: [
                                {
                                    type: "paramExp",
                                    content: [
                                        {
                                            type: "paramPath",
                                            content: [{
                                                type: "identifier",
                                                content: 'a',
                                                start: 0,
                                                end: 1
                                            }]
                                        },
                                        {
                                            type: "operator",
                                            content: 'eq',
                                            start: 2,
                                            end: 4
                                        },
                                        {
                                            type: "compValue",
                                            content: {
                                                type: "number",
                                                content: '5',
                                                start: 5,
                                                end: 6
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "operator",
                            content: "and",
                            start: 7,
                            end: 10
                        },
                        {
                            type: "filter",
                            content: [
                                {
                                    type: "paramExp",
                                    content: [
                                        {
                                            type: "paramPath",
                                            content: [{
                                                type: "identifier",
                                                content: 'b',
                                                start: 11,
                                                end: 12
                                            }]
                                        },
                                        {
                                            type: "operator",
                                            content: 'gt',
                                            start: 13,
                                            end: 15
                                        },
                                        {
                                            type: "compValue",
                                            content: {
                                                type: "number",
                                                content: '6',
                                                start: 16,
                                                end: 17
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                })
                expect(tokens.length).to.equal(0)
            })

            it ("a eq 5 or b gt 6", () => {
                let tokens = tokenize('a eq 5 or b gt 6');
                expect(logExp(tokens)).to.deep.equal({
                    type: "logExp",
                    content: [
                        {
                            type: "filter",
                            content: [
                                {
                                    type: "paramExp",
                                    content: [
                                        {
                                            type: "paramPath",
                                            content: [{
                                                type: "identifier",
                                                content: 'a',
                                                start: 0,
                                                end: 1
                                            }]
                                        },
                                        {
                                            type: "operator",
                                            content: 'eq',
                                            start: 2,
                                            end: 4
                                        },
                                        {
                                            type: "compValue",
                                            content: {
                                                type: "number",
                                                content: '5',
                                                start: 5,
                                                end: 6
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "operator",
                            content: "or",
                            start: 7,
                            end: 9
                        },
                        {
                            type: "filter",
                            content: [
                                {
                                    type: "paramExp",
                                    content: [
                                        {
                                            type: "paramPath",
                                            content: [{
                                                type: "identifier",
                                                content: 'b',
                                                start: 10,
                                                end: 11
                                            }]
                                        },
                                        {
                                            type: "operator",
                                            content: 'gt',
                                            start: 12,
                                            end: 14
                                        },
                                        {
                                            type: "compValue",
                                            content: {
                                                type: "number",
                                                content: '6',
                                                start: 15,
                                                end: 16
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                })
                expect(tokens.length).to.equal(0)
            })

            it ("a eq 5 or (b gt 6)", () => {
                let tokens = tokenize('a eq 5 or (b gt 6)');
                expect(logExp(tokens)).to.deep.equal({
                    type: "logExp",
                    content: [
                        {
                            type: "filter",
                            content: [
                                {
                                    type: "paramExp",
                                    content: [
                                        {
                                            type: "paramPath",
                                            content: [{
                                                type: "identifier",
                                                content: 'a',
                                                start: 0,
                                                end: 1
                                            }]
                                        },
                                        {
                                            type: "operator",
                                            content: 'eq',
                                            start: 2,
                                            end: 4
                                        },
                                        {
                                            type: "compValue",
                                            content: {
                                                type: "number",
                                                content: '5',
                                                start: 5,
                                                end: 6
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "operator",
                            content: "or",
                            start: 7,
                            end: 9
                        },
                        {
                            type: "block",
                            content: [
                                {
                                    type: "filter",
                                    content: [
                                        {
                                            type: "paramExp",
                                            content: [
                                                {
                                                    type: "paramPath",
                                                    content: [
                                                        {
                                                            type: "identifier",
                                                            content: 'b',
                                                            start: 11,
                                                            end: 12
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "operator",
                                                    content: 'gt',
                                                    start: 13,
                                                    end: 15
                                                },
                                                {
                                                    type: "compValue",
                                                    content: {
                                                        type: "number",
                                                        content: '6',
                                                        start: 16,
                                                        end: 17
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                })
                expect(tokens.length).to.equal(0)
            })
        })

        describe("lexFilter", () => {
            it ("a eq 5", () => {
                let tokens = tokenize('a eq 5')
                expect(filter(tokens)).to.deep.equal({
                    type: "filter",
                    content: [
                        {
                            type: "paramExp",
                            content: [
                                {
                                    type: "paramPath",
                                    content: [
                                        {
                                            type: "identifier",
                                            content: "a",
                                            start: 0,
                                            end: 1
                                        }
                                    ]
                                },
                                {
                                    type: "operator",
                                    content: "eq",
                                    start: 2,
                                    end: 4
                                },
                                {
                                    type: "compValue",
                                    content: {
                                        type: "number",
                                        content: "5",
                                        start: 5,
                                        end: 6
                                    }
                                }
                            ]
                        }
                    ]
                })
                expect(tokens.length).to.equal(0)
            })

            it ("a eq 5 and b gt 6", () => {
                let tokens = tokenize('a eq 5 and b gt 6');
                let ast = filter(tokens)
                // console.log(JSON.stringify(ast, null, 4))
                expect(ast).to.deep.equal({
                    type: "filter",
                    content: [{
                        type: "logExp",
                        content: [
                            {
                                type: "filter",
                                content: [
                                    {
                                        type: "paramExp",
                                        content: [
                                            {
                                                type: "paramPath",
                                                content: [{
                                                    type: "identifier",
                                                    content: 'a',
                                                    start: 0,
                                                    end: 1
                                                }]
                                            },
                                            {
                                                type: "operator",
                                                content: 'eq',
                                                start: 2,
                                                end: 4
                                            },
                                            {
                                                type: "compValue",
                                                content: {
                                                    type: "number",
                                                    content: '5',
                                                    start: 5,
                                                    end: 6
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                type: "operator",
                                content: "and",
                                start: 7,
                                end: 10
                            },
                            {
                                type: "filter",
                                content: [
                                    {
                                        type: "paramExp",
                                        content: [
                                            {
                                                type: "paramPath",
                                                content: [{
                                                    type: "identifier",
                                                    content: 'b',
                                                    start: 11,
                                                    end: 12
                                                }]
                                            },
                                            {
                                                type: "operator",
                                                content: 'gt',
                                                start: 13,
                                                end: 15
                                            },
                                            {
                                                type: "compValue",
                                                content: {
                                                    type: "number",
                                                    content: '6',
                                                    start: 16,
                                                    end: 17
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }]
                })
                expect(tokens.length).to.equal(0)
            })

            it ("a eq 5 and b gt 6", () => {
                let tokens = tokenize('a eq 5 and (b gt 6)');
                let ast = filter(tokens)
                // console.log(JSON.stringify(ast, null, 4))
                expect(ast).to.deep.equal({
                    type: "filter",
                    content: [{
                        type: "logExp",
                        content: [
                            {
                                type: "filter",
                                content: [
                                    {
                                        type: "paramExp",
                                        content: [
                                            {
                                                type: "paramPath",
                                                content: [{
                                                    type: "identifier",
                                                    content: 'a',
                                                    start: 0,
                                                    end: 1
                                                }]
                                            },
                                            {
                                                type: "operator",
                                                content: 'eq',
                                                start: 2,
                                                end: 4
                                            },
                                            {
                                                type: "compValue",
                                                content: {
                                                    type: "number",
                                                    content: '5',
                                                    start: 5,
                                                    end: 6
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                type: "operator",
                                content: "and",
                                start: 7,
                                end: 10
                            },
                            {
                                type: "block",
                                content: [
                                    {
                                        type: "filter",
                                        content: [
                                            {
                                                type: "paramExp",
                                                content: [
                                                    {
                                                        type: "paramPath",
                                                        content: [{
                                                            type: "identifier",
                                                            content: 'b',
                                                            start: 12,
                                                            end: 13
                                                        }]
                                                    },
                                                    {
                                                        type: "operator",
                                                        content: 'gt',
                                                        start: 14,
                                                        end: 16
                                                    },
                                                    {
                                                        type: "compValue",
                                                        content: {
                                                            type: "number",
                                                            content: '6',
                                                            start: 17,
                                                            end: 18
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }]
                })
                expect(tokens.length).to.equal(0)
            })
        })

        it ("a[b ge 4].b eq 5", () => {
            expect(filter(tokenize('a[b ge 4].b eq 5'))).to.deep.equal({
                type: "filter",
                content: [
                    {
                        type: "paramExp",
                        content: [
                            {
                                type: "paramPath",
                                content: [
                                    {
                                        type: "identifier",
                                        content: "a",
                                        start: 0,
                                        end: 1
                                    },
                                    {
                                        type: "filter",
                                        content: [
                                            {
                                                type: "paramExp",
                                                content: [
                                                    {
                                                        type: "paramPath",
                                                        content: [
                                                            {
                                                                type: "identifier",
                                                                content: "b",
                                                                start: 2,
                                                                end: 3
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: "operator",
                                                        content: "ge",
                                                        start: 4,
                                                        end: 6
                                                    },
                                                    {
                                                        type: "compValue",
                                                        content: {
                                                            type: "number",
                                                            start: 7,
                                                            end: 8,
                                                            content: "4"
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        type: "identifier",
                                        start: 10,
                                        end: 11,
                                        content: "b"
                                    }
                                ]
                            },
                            {
                                type: "operator",
                                content: "eq",
                                start: 12,
                                end: 14
                            },
                            {
                                type: "compValue",
                                content: {
                                    type: "number",
                                    content: "5",
                                    start: 15,
                                    end: 16
                                }
                            }
                        ]
                    }
                ]
            })
        })
    })
})