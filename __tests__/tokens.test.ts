import { Lexer } from "../src/lexers/lexer";
import { Token } from "../src/tokens/token";
import * as fs from "fs";
import * as os from "os";
import * as toml from "@iarna/toml";

interface TestEntry {
    readonly test: TestData[];
}

interface TestData {
    readonly name: string;
    readonly jfol: string;
    readonly tokens: TestToken[];
}

interface TestToken {
    readonly text: string;
    readonly token: string;
}

function testTokens(expectTokens: TestToken[], actualTokens: Token[]) {
    expect(actualTokens.length).toBe(expectTokens.length);
    for (let i = 0; i < expectTokens.length; i++) {
        const expectToken = expectTokens[i];
        const actualToken = actualTokens[i];

        expect(actualToken.rawText).toBe(expectToken.text);
        expect(actualToken.type).toBe(expectToken.token);
    }
}

const testDatas: TestData[] = [];

beforeAll(() => {
    const files = fs.readdirSync("data/tokens");
    for (const file of files) {
        if (file.endsWith(".toml") == false) {
            continue;
        }
        const content = fs.readFileSync(`data/tokens/${file}`).toString();
        const testEntry = (toml.parse(content) as unknown) as TestEntry;
        for (const testData of testEntry.test) {
            testDatas.push(testData);
        }
    }
});

test("test from Jfol.Test tokens", () => {
    const lexer = new Lexer();

    for (const testData of testDatas) {
        test(testData.name, () => {
            // cut last line break and replace line break
            const source = testData.jfol.substring(0, testData.jfol.length - os.EOL.length).replace(os.EOL, "\n");
            const tokens = lexer.analyzeToken(source);
            testTokens(testData.tokens, tokens);
        });
    }
});
