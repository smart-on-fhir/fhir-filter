export default class Token {
    constructor(type, start, end, content) {
        this.type = type;
        this.start = start;
        this.end = end;
        this.content = content;
    }
    toString() {
        return this.content;
    }
}
