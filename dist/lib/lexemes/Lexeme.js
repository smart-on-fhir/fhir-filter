export class PathLexeme {
    constructor(content) {
        this.type = "paramPath";
        this.content = content;
    }
    toString() {
        return this.content.reduce((prev, cur) => {
            let out = String(cur);
            if (prev) {
                if (cur instanceof FilterLexeme) {
                    out = prev + out;
                }
                else {
                    out = prev + "." + out;
                }
            }
            return out;
        }, "");
    }
}
export class FilterLexeme {
    constructor(content) {
        this.type = "filter";
        this.content = content;
    }
    toString() {
        return "[" + this.content.map(x => x.toString()).join(" ") + "]";
    }
}
export class CompValueLexeme {
    constructor(content) {
        this.type = "compValue";
        this.content = content;
    }
    toString() {
        return this.content.content.toString();
    }
}
export class BlockLexeme {
    constructor(content) {
        this.type = "block";
        this.content = [content];
    }
    toString() {
        return "(" + this.content[0].toString() + ")";
    }
}
export class NegationLexeme {
    constructor(content) {
        this.type = "negation";
        this.content = [content];
    }
    toString() {
        return "not(" + this.content[0].toString() + ")";
    }
}
export class LogExpLexeme {
    constructor(content) {
        this.type = "logExp";
        this.content = content;
    }
    toString() {
        return this.content.map(x => x.toString()).join(" ");
    }
}
export class ParamExpLexeme {
    constructor(content) {
        this.type = "paramExp";
        this.content = content;
    }
    toString() {
        return this.content.map(x => x.toString()).join(" ");
    }
}
