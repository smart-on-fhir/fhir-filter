import { COMPARISON_OPERATORS } from "../config";
import Variable from "./Variable";


export default class NumberVariable extends Variable<number> {
    
    public constructor(value: number) {
        super(value);
    }

    public op(operator: keyof typeof COMPARISON_OPERATORS, right: Variable<number|string>): boolean {
        switch(operator) {
            case "eq":
                return this.value === +String(right);
            case "ne":
                return this.value !== +String(right);
            case "gt":
                return this.value > +String(right);
            case "ge":
                return this.value >= +String(right);
            case "lt":
                return this.value < +String(right);
            case "le":
                return this.value <= +String(right);
            default:
                throw new Error(`Operator "${operator}" not supported for number variables`);
        }
    }
}