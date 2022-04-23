import { JSONObject }          from "..";
import { filter }              from "./evaluate";
import { filter as lexFilter } from "./lexer";
import { tokenize }            from "./tokenizer";


function fhirFilter<T extends JSONObject = JSONObject>(data: T[], f: string) {
    return data.filter(fhirFilter.create(f));
}

fhirFilter.create = function createFilter<T extends JSONObject = JSONObject>(f: string) {
    let tok = tokenize(f);
    let ast = lexFilter(tok)!;
    
    if (!ast || tok.length) {
        throw new Error(`Failed to parse filter expression`);
    }

    return (ctx: T, i: number, all: T[]) => {
        try {
            return !!filter(ctx, (ast.content as any)[0]);
        } catch (ex) {
            (ex as Error).message = `Error applying filter to item ${i}: ` +
                (ex as Error).message;
            throw ex;
        }
    };
};

// module.exports = fhirFilter
export default fhirFilter