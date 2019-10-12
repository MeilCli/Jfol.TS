import { Lexer } from "../src/lexers/lexer";
import { Parser } from "../src/ast/parser";
import { Analyzer } from "../src/semantic/analyzer";
import * as fs from "fs";
import * as yaml from "yaml";

interface TestData {
    readonly name: string;
    readonly jfol: string;
    readonly nodes: object;
}

const testDatas: TestData[] = [];

beforeAll(() => {
    const files = fs.readdirSync("data/nodes");
    for (const file of files) {
        if (file.endsWith(".yml") == false) {
            continue;
        }
        const content = fs.readFileSync(`data/nodes/${file}`).toString();
        const foundTestDatas = yaml.parse(content) as TestData[];
        for (const testData of foundTestDatas) {
            testDatas.push(testData);
        }
    }
});

test("test from Jfol.Test nodes", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const analyzer = new Analyzer();

    for (const testData of testDatas) {
        test(testData.name, () => {
            const tokens = lexer.analyzeToken(testData.jfol);
            const parentNode = analyzer.analyze(parser.parseToken(tokens));
            expect(parentNode.nodes).toEqual(testData.nodes);
        });
    }
});
