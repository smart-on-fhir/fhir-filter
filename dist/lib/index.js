import { filter } from "./evaluate";
import { filter as lexFilter } from "./lexer";
import { tokenize } from "./tokenizer";
function fhirFilter(data, f) {
    return data.filter(fhirFilter.create(f));
}
fhirFilter.create = function createFilter(f) {
    let tok = tokenize(f);
    let ast = lexFilter(tok);
    if (!ast || tok.length) {
        throw new Error(`Failed to parse filter expression`);
    }
    return (ctx, i, all) => {
        try {
            return !!filter(ctx, ast.content[0]);
        }
        catch (ex) {
            ex.message = `Error applying filter to item ${i}: ` +
                ex.message;
            throw ex;
        }
    };
};
// module.exports = fhirFilter
export default fhirFilter;
