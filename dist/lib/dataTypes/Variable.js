export default class Variable {
    constructor(value) {
        this.value = value;
    }
    valueOf() {
        return this.value;
    }
    toString() {
        return String(this.value);
    }
    toJSON() {
        return this.value;
    }
}
