import { CompilerPlugin } from "./compiler_plugin";
import { Context } from "./context";
import { Function } from "./function";
import { IfFunction } from "./functions/if_function";
import { FunctionParentNode } from "../nodes/function_node";
import { IndexFunction } from "./functions/index_function";
import { LengthFunction } from "./functions/length_function";
import { NumberFunction } from "./functions/number_function";
import { SeparatorFunction } from "./functions/separator_function";
import { ValueFunction } from "./functions/value_function";
import { WhereFunction } from "./functions/where_function";
import { Lexer } from "../lexers/lexer";
import { Parser } from "../ast/parser";
import { Analyzer } from "../semantic/analyzer";

class FormatCompilerPlugin extends CompilerPlugin {
    functions: [string, (arg0: Context, arg1: FunctionParentNode) => Function][] = [
        ["if", (x, y) => new IfFunction(this, x, y)],
        ["index", (x, y) => new IndexFunction(this, x, y)],
        ["length", (x, y) => new LengthFunction(this, x, y)],
        ["number", (x, y) => new NumberFunction(this, x, y)],
        ["separator", (x, y) => new SeparatorFunction(this, x, y)],
        ["value", (x, y) => new ValueFunction(this, x, y)],
        ["where", (x, y) => new WhereFunction(this, x, y)]
    ];
}

export class Compiler {
    format(jfol: string, json: string): string {
        const lexer = new Lexer();
        const parser = new Parser();
        const analyzer = new Analyzer();
        const compilerPlugin = new FormatCompilerPlugin();

        const parentNode = analyzer.analyze(parser.parseToken(lexer.analyzeToken(jfol)));
        const value = JSON.parse(json);
        const context = new Context(value);

        let text = "";

        for (const node of parentNode.nodes) {
            // eslint-disable-next-line @typescript-eslint/ban-types
            const object = compilerPlugin.getObject(context, node);
            text += object.executeString();
        }

        return text;
    }
}
