import { Lexer } from "../src/lexers/lexer";
import { Token } from "../src/tokens/token";

function testTokens(expectTokens: Token[], actualTokens: Token[]) {
    expect(actualTokens.length).toBe(expectTokens.length);
    for (let i = 0; i < expectTokens.length; i++) {
        const expectToken = expectTokens[i];
        const actualToken = actualTokens[i];

        expect(actualToken.rawText).toBe(expectToken.rawText);
        expect(actualToken.type).toBe(expectToken.type);
    }
}

test("simple analyze", () => {
    const lexer = new Lexer();
    const source = "Packages Total: $$(array.length)\n$array[$$index: $(package.name)$$separator[\n]]";
    const tokens = lexer.analyzeToken(source);

    testTokens(
        [
            { rawText: "Packages", type: "Text" },
            { rawText: " ", type: "Space" },
            { rawText: "Total", type: "Text" },
            { rawText: ":", type: "Colon" },
            { rawText: " ", type: "Space" },
            { rawText: "$$", type: "DoubleDollar" },
            { rawText: "(", type: "LeftParenthesis" },
            { rawText: "array", type: "Text" },
            { rawText: ".", type: "Dot" },
            { rawText: "length", type: "Text" },
            { rawText: ")", type: "RightParenthesis" },
            { rawText: "\n", type: "Text" },
            { rawText: "$", type: "Dollar" },
            { rawText: "array", type: "Text" },
            { rawText: "[", type: "LeftSquareBracket" },
            { rawText: "$$", type: "DoubleDollar" },
            { rawText: "index", type: "Text" },
            { rawText: ":", type: "Colon" },
            { rawText: " ", type: "Space" },
            { rawText: "$", type: "Dollar" },
            { rawText: "(", type: "LeftParenthesis" },
            { rawText: "package", type: "Text" },
            { rawText: ".", type: "Dot" },
            { rawText: "name", type: "Text" },
            { rawText: ")", type: "RightParenthesis" },
            { rawText: "$$", type: "DoubleDollar" },
            { rawText: "separator", type: "Text" },
            { rawText: "[", type: "LeftSquareBracket" },
            { rawText: "\n", type: "Text" },
            { rawText: "]", type: "RightSquareBracket" },
            { rawText: "]", type: "RightSquareBracket" }
        ],
        tokens
    );
});

test("escape", () => {
    const lexer = new Lexer();
    const source = "\\$ \\$\\$ \\( \\) \\[ \\] \\\\";
    const tokens = lexer.analyzeToken(source);

    testTokens(
        [
            { rawText: "$", type: "Text" },
            { rawText: " ", type: "Space" },
            { rawText: "$", type: "Text" },
            { rawText: "$", type: "Text" },
            { rawText: " ", type: "Space" },
            { rawText: "(", type: "Text" },
            { rawText: " ", type: "Space" },
            { rawText: ")", type: "Text" },
            { rawText: " ", type: "Space" },
            { rawText: "[", type: "Text" },
            { rawText: " ", type: "Space" },
            { rawText: "]", type: "Text" },
            { rawText: " ", type: "Space" },
            { rawText: "\\", type: "Text" }
        ],
        tokens
    );
});

test("oprator", () => {
    const lexer = new Lexer();
    const source = `"Text \\"A\\""==1+2*3/4&&true||false`;
    const tokens = lexer.analyzeToken(source);

    testTokens(
        [
            { rawText: '"', type: "DoubleQuotation" },
            { rawText: "Text", type: "Text" },
            { rawText: " ", type: "Space" },
            { rawText: '"', type: "Text" },
            { rawText: "A", type: "Text" },
            { rawText: '"', type: "Text" },
            { rawText: '"', type: "DoubleQuotation" },
            { rawText: "=", type: "Equal" },
            { rawText: "=", type: "Equal" },
            { rawText: "1", type: "Text" },
            { rawText: "+", type: "Plus" },
            { rawText: "2", type: "Text" },
            { rawText: "*", type: "Asterisk" },
            { rawText: "3", type: "Text" },
            { rawText: "/", type: "Slash" },
            { rawText: "4", type: "Text" },
            { rawText: "&", type: "Ampersand" },
            { rawText: "&", type: "Ampersand" },
            { rawText: "true", type: "Text" },
            { rawText: "|", type: "VerticalLine" },
            { rawText: "|", type: "VerticalLine" },
            { rawText: "false", type: "Text" }
        ],
        tokens
    );
});
