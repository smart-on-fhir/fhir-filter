import { COMPARISON_OPERATORS } from "../config";
import Variable from "./Variable";


export default class TokenVariable extends Variable<string> {

    constructor(value: string) {
        super(value);
    }

    /**
     * Compares this token with another one (case insensitive). Since
     * this returns a number, it can be used for both equality check and for
     * sorting.
     * @param compareWith
     */
    protected compare(compareWith: TokenVariable): number {
        return String(this.value).toLowerCase().localeCompare(compareWith.valueOf().toLowerCase());
    }

    public op(operator: keyof typeof COMPARISON_OPERATORS, right: any): boolean
    {
        switch (operator) {
            case "eq": // equal
                return this.compare(right) === 0;
            
            case "ne": // not equal
                return this.compare(right) !== 0;
            
            case "ss": // True if the value subsumes a concept in the set
            case "sb": // True if the value is subsumed by a concept in the set
            case "in": // True if one of the concepts is in the nominated value set by URI, either a relative, literal or logical vs
                throw new Error(`Operator "${operator}" not implemented for tokens`);

            default:
                throw new Error(`Operator "${operator}" not supported for token variables`);
        }
    }
}