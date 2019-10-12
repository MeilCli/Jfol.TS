import { Lexer } from "../src/lexers/lexer";
import { Parser } from "../src/ast/parser";

test("success", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = `"$$function($value)"`;

    parser.parseToken(lexer.analyzeToken(source));
});
