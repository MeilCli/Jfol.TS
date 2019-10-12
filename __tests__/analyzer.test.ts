import { Lexer } from "../src/lexers/lexer";
import { Parser } from "../src/ast/parser";
import { Analyzer } from "../src/semantic/analyzer";

test("success", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const analyzer = new Analyzer();
    const source = `$$function(10+20*30)`;
    analyzer.analyze(parser.parseToken(lexer.analyzeToken(source)));
});
