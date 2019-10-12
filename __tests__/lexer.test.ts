import { Lexer } from "../src/lexers/lexer";

test("success", () => {
    const lexer = new Lexer();
    const source = "Packages Total: $$(array.length)\n$array[$$index: $(package.name)$$separator[\n]]";
    lexer.analyzeToken(source);
});
