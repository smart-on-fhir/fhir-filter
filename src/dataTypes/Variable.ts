import { ComparisonOperator } from "../..";

export default abstract class Variable<T = unknown>
{
    /**
     * The internal value of the variable
     */
    public readonly value: T;
 
    protected constructor(value: T) {
        this.value = value;
    }

    public valueOf(): T {
        return this.value;
    }

    public toString(): string {
        return String(this.value);
    }
    
    public toJSON(): any {
        return this.value;
    }

    abstract op(operator: ComparisonOperator, right: any): boolean;
}