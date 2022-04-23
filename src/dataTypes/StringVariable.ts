import { ComparisonOperator } from "../..";
import Variable from "./Variable";


export default class StringVariable extends Variable<string> {

    constructor(value: string) {
        super(value);
    }

    /**
     * Compares this string variable with another one (case insensitive). Since
     * this returns a number, it can be used for both equality check and for
     * sorting.
     * @param compareWith
     */
    public compare(compareWith: StringVariable): number {
        return String(this.value).toLowerCase().localeCompare(compareWith.valueOf().toLowerCase());
    }

    public op(operator: ComparisonOperator, right: any): boolean {
        if (!(right instanceof StringVariable)) {
            right = new StringVariable(String(right))
        }
        switch(operator) {
            case "eq":
                return this.value.toLowerCase() === right.value.toLowerCase();
            case "ne":
                return this.value.toLowerCase() != right.value.toLowerCase();
            case "lt":
                return this.compare(right) < 0;
            case "le":
                return this.compare(right) <= 0;
            case "gt":
                return this.compare(right) > 0;
            case "ge":
                return this.compare(right) >= 0;
            case "co":
                return this.value.toLowerCase().includes(right.value.toLowerCase());
            case "sw":
                return this.value.toLowerCase().startsWith(right.value.toLowerCase());
            case "ew":
                return this.value.toLowerCase().endsWith(right.value.toLowerCase());
            default:
                throw new Error(`Operator "${operator}" not supported for string variables`);
        }
    }
}