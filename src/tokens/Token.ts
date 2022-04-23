import { TokenType } from "../..";

export default class Token<T=TokenType> {
    type   : T;
    start  : number;
    end    : number;
    content: string | Token[];

    constructor(type: T, start: number, end: number, content: string) {
        this.type   = type;
        this.start  = start;
        this.end    = end;
        this.content = content;
    }

    toString() {
        return this.content
    }
}