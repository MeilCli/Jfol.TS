import { Compiler } from "../src/compilers/compiler";
import * as fs from "fs";
import * as toml from "@iarna/toml";

interface TestEntry {
    readonly test: TestData[];
}

interface TestData {
    readonly name: string;
    readonly json: string;
    readonly jfol: string;
    readonly text: string;
}

const testDatas: TestData[] = [];

beforeAll(() => {
    const files = fs.readdirSync("data/texts");
    for (const file of files) {
        if (file.endsWith(".toml") == false) {
            continue;
        }
        const content = fs.readFileSync(`data/texts/${file}`).toString();
        const testEntry = (toml.parse(content) as unknown) as TestEntry;
        for (const testData of testEntry.test) {
            testDatas.push(testData);
        }
    }
});

test("test from Jfol.Test texts", () => {
    const compiler = new Compiler();

    for (const testData of testDatas) {
        test(testData.name, () => {
            const text = compiler.format(testData.jfol, testData.json);
            expect(text).toBe(testData.text);
        });
    }
});
