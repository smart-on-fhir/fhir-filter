import { describe, it } from "mocha"
import { expect }       from "chai"
import fhirFilter       from "../src/"
import { JSONObject }   from "..";


describe("filter", () => {

    const ctx: JSONObject[] = [
        {
            name: "patient 1",
            dob: "2001-03-05",
            visits: 5,
            practitioner: { reference: "a/123" },
            dod: null,
            q: "100g"
        },
        {
            name: "patient 2",
            dob: "2001-06-15",
            visits: 3,
            practitioner: { reference: "a/234" },
            dod: "2020-07",
            q: "120g"
        }
    ];

    const tests: Record<string, {input: string, result: any, only?: boolean }[]> = {

        "Simple string filters": [
            { input: 'name eq "patient 1"', result: [ctx[0]] },
            { input: 'name eq "patient 2"', result: [ctx[1]] },
            { input: 'name eq "missing"'  , result: []       },
            { input: 'name ne "patient 1"', result: [ctx[1]] },
            { input: 'name ne "patient 2"', result: [ctx[0]] },
            { input: 'name ne "missing"'  , result: ctx      },
            { input: 'name gt "patient 1"', result: [ctx[1]] },
            { input: 'name gt "patient 0"', result: ctx      },
            { input: 'name gt "a"'        , result: ctx      },
            { input: 'name sw "patient 1"', result: [ctx[0]] },
            { input: 'name sw "patient 2"', result: [ctx[1]] },
            { input: 'name sw "patient"'  , result: ctx      },
            { input: 'name sw "missing"'  , result: []       },
            { input: 'name co "patient"'  , result: ctx      },
            { input: 'name co "x"'        , result: []       },
        ],

        "Paths": [
            { input: 'practitioner.reference eq "a/123"', result: [ctx[0]] },
            { input: 'practitioner.reference eq "a/123" and q eq 100g', result: [ctx[0]] },
            // { input: 'practitioner[reference eq "a/123"].dod eq null', result: [ctx[0]] },
        ],

        "Simple number filters": [
            { input: 'visits gt 3', result: [ctx[0]] },
            { input: 'visits gt 2', result: ctx      },
            { input: 'visits gt 9', result: []       },
        ],

        "Simple date filters": [
            { input: 'dob gt 2001-03-05', result: [ctx[1]] },
            { input: 'dob ge 2001-03-05', result: ctx      },
        ],

        "Simple token filters": [
            { input: 'dod eq null', result: [ctx[0]] },
            { input: 'dod ne null', result: [ctx[1]] },
        ],

        "Logical expressions": [
            // { input: '$[visits gt 3]'                     , result: [ctx[0]] },
            { input: 'dod ne null and dod ge 2001-01-01'    , result: [ctx[1]] },
            { input: 'visits gt 3 and name eq "Patient 1"'  , result: [ctx[0]] },
            { input: 'dob ge 2031-05 or name eq "Patient 1"', result: [ctx[0]] },
            { input: 'dob le 1031-05 or name eq "Patient 2"', result: [ctx[1]] },
            // { input: '(visits gt 3)'                      , result: [ctx[0]] },
            // { input: '[visits gt 3].name eq "Patient 1"'  , result: [ctx[0]] },
            // { input: 'visits gt 3 or name eq "Patient 2"' , result: ctx      },
            // { input: 'q gt 100g'                          , result: [ctx[1]] },
        ],

        "References": [
            { input: 'practitioner re "a/123"'   , result: [ctx[0]] },
            { input: 'practitioner re "a/12"'    , result: []       },
        ]
    };

    for (const group in tests) {
        describe(group, () => {
            tests[group].forEach(({ input, result, only }) => {
                const test = only ? it.only : it;
                test(`${JSON.stringify(input)} => ${JSON.stringify(result)}`, () => {
                    expect(ctx.filter(fhirFilter.create(input))).to.deep.equal(result)
                    expect(fhirFilter(ctx, input)).to.deep.equal(result)
                })
            });
        })
    }

    it ("throws on invalid filter expressions", () => {
        expect(() => fhirFilter.create('123_rt eq 2')).to.throw("Expected valid filter expression")
        expect(() => fhirFilter.create('a eq 2 and')).to.throw("Failed to parse filter expression")
        expect(() => fhirFilter([], 'a eq 2 and')).to.throw("Failed to parse filter expression")
        expect(() => fhirFilter([{}, { a: null }], 'a gt 2')).to.throw('Error applying filter to item 1: Operator "gt" not supported for token variables')
        expect(() => fhirFilter.create('a eq x')).to.throw("Expected valid filter expression")
    })

    it ("throws on using 're' against non-objects", () => {
        expect(() => fhirFilter([{ a: 1 }], 'a re "x"')).to.throw('Error applying filter to item 0: The "re" operator can only be used on objects')
    })

})

