import { ComparisonOperator } from "../..";
import Variable from "./Variable";


export default class DateVariable extends Variable<Date> {

    public readonly precision: string;

    public constructor(value: string) {

        // YYYY
        if (value.length === 4) {
            super(new Date(+value, 0, 1, 0, 0, 0, 1));
            this.precision = "year";
        }

        // YYYY-MM
        else if (value.length === 7) {
            const [year, month] = value.split("-")
            super(new Date(+year, +month - 1, 1, 0, 0, 0, 1));
            this.precision = "month";
        }

        // YYYY-MM-DD
        else if (value.length === 10) {
            const [year, month, day] = value.split("-")
            super(new Date(+year, +month - 1, +day, 0, 0, 0, 1));
            this.precision = "day";
        }

        // YYYY-MM-DDTHH:mm:dd...
        else {
            super(new Date(value));
            this.precision = "millisecond";
        }
    }

    /**
     * Compares this string variable with another one (case insensitive). Since
     * this returns a number, it can be used for both equality check and for
     * sorting.
     * @param compareWith
     */
    protected compare(compareWith: DateVariable): number {
        const thisDate = this.value;
        const thatDate = compareWith.value;
        switch (compareWith.precision) {
            case "year":
                return (
                    (new Date(thisDate.getFullYear(), 0).valueOf()) -
                    (new Date(thatDate.getFullYear(), 0).valueOf())
                );
            case "month":
                return (
                    new Date(thisDate.getFullYear(), thisDate.getMonth()).valueOf() -
                    new Date(thatDate.getFullYear(), thatDate.getMonth()).valueOf()
                );
            case "day":
                return (
                    new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate(), 0, 0, 0, 1).valueOf() -
                    new Date(thatDate.getFullYear(), thatDate.getMonth(), thatDate.getDate(), 0, 0, 0, 1).valueOf()
                );
            default:
                return thisDate.valueOf() - thatDate.valueOf();
        }
    }

    /**
     * Date is the same including same precision and time zone if provided
     * @param needle 
     */
    protected contains(needle: DateVariable): boolean {
        const thisDate = this.value;
        const thatDate = needle.value;
        switch (this.precision) {
            case "year":
                return (
                    (new Date(thatDate.getFullYear(), 0).valueOf()) ===
                    (new Date(thisDate.getFullYear(), 0).valueOf())
                );
            case "month":
                return (
                    new Date(thatDate.getFullYear(), thatDate.getMonth()).valueOf() ===
                    new Date(thisDate.getFullYear(), thisDate.getMonth()).valueOf()
                );
            case "day":
                return (
                    new Date(thatDate.getFullYear(), thatDate.getMonth(), thatDate.getDate(), 0, 0, 0, 1).valueOf() ===
                    new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate(), 0, 0, 0, 1).valueOf()
                );
            default:
                return thatDate.valueOf() === thisDate.valueOf();
        }
    }

    protected start(): Date {
        switch (this.precision) {
            case "year":
                return new Date(this.value.getFullYear(), 0, 1, 0, 0, 0, 0);
            case "month":
                return new Date(this.value.getFullYear(), this.value.getMonth(), 1, 0, 0, 0, 0);
            case "day":
                return new Date(this.value.getFullYear(), this.value.getMonth(), this.value.getDate(), 0, 0, 0, 0);
            default:
                return new Date(this.value);
        }
    }

    protected end(): Date {
        switch (this.precision) {
            case "year":
                return new Date(this.value.getFullYear(), 11, 31, 23, 59, 59, 999);
            case "month":
                return new Date(this.value.getFullYear(), this.value.getMonth() + 1, -1, 23, 59, 59, 999);
            case "day":
                return new Date(this.value.getFullYear(), this.value.getMonth(), this.value.getDate(), 23, 59, 59, 999);
            default:
                return new Date(this.value);
        }
    }

    protected overlaps(needle: DateVariable): boolean {
        // --- |   - | -   |  -  | --- | --- | --- | -   |   - |
        // --- | --- | --- | --- | -   |   - |  -  |   - | -   |
        //  1  |  1  |  1  |  1  |  1  |  1  |  1  |  0  |  0  |
        return !(this.start() > needle.end() || this.end() < needle.start());
    }

    public op(operator: ComparisonOperator, right: DateVariable): boolean {
        switch(operator) {
            case "eq":
                return this.compare(right) === 0;
            case "ne":
                return this.compare(right) !== 0;
            case "gt":
                return this.compare(right) > 0;
            case "ge":
                return this.compare(right) >= 0;
            case "lt":
                return this.compare(right) < 0;
            case "le":
                return this.compare(right) <= 0;
            case "co":
                return this.contains(right);
            case "po":
                return this.overlaps(right);
            default:
                throw new Error(`Operator "${operator}" not supported for dates`);
        }
    }
}