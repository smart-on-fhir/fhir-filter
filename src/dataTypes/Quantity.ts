import { COMPARISON_OPERATORS } from "../config";
import Variable from "./Variable";


export default class QuantityVariable extends Variable<number> {

    readonly unit: string;

    constructor(input: string) {

        const match = input.match(/^(-?(0|[1-9][0-9]*)(\.[0-9]+)?)([a-z]+)$/i)!
        super(+match[1]);
        this.unit = match[4];
    }

    public toString(): string {
        return this.value + this.unit;
    }

    public toJSON(): any {
        return {
            value: this.value,
            unit : this.unit
        };
    }

    public op(operator: keyof typeof COMPARISON_OPERATORS, right: QuantityVariable): boolean {
        if (this.unit.toLowerCase() !== right.unit.toLowerCase()) {
            throw new Error(`Cannot compare quantities with different units`)
        }
        switch(operator) {
            case "eq":
                return this.value == right.value;
            case "ne":
                return this.value != right.value;
            case "lt":
                return this.value < right.value;
            case "le":
                return this.value <= right.value;
            case "gt":
                return this.value > right.value;
            case "ge":
                return this.value >= right.value;
            default:
                throw new Error(`Operator "${operator}" not supported for quantity variables`);
        }
    }
}