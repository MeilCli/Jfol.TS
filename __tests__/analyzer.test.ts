import { Lexer } from "../src/lexers/lexer";
import { Parser } from "../src/ast/parser";
import { Analyzer } from "../src/semantic/analyzer";
import { Node, ParentNode } from "../src/nodes/node";
import { TextNode } from "../src/nodes/text_node";
import { FieldNode, FieldParentNode, FieldParentNodeWithBody } from "../src/nodes/field_node";
import {
    FunctionNode,
    FunctionParentNode,
    FunctionParentNodeWithArgument,
    FunctionParentNodeWithBody
} from "../src/nodes/function_node";
import { StringNode, BooleanNode, NumberNode, NullNode } from "../src/nodes/literal_node";
import { OperatorNode } from "../src/nodes/operator_node";
import { ExpressionNode } from "../src/nodes/expression_node";

test("simple parse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const analyzer = new Analyzer();
    const source = "Packages Total: $$(array.length)\n$array[$$index: $(package.name)$$separator[\n]]";

    const parentNode = analyzer.analyze(parser.parseToken(lexer.analyzeToken(source)));

    expect(parentNode).toEqual({
        nodes: [
            { text: "Packages" } as TextNode,
            { text: " " } as TextNode,
            { text: "Total" } as TextNode,
            { text: ":" } as TextNode,
            { text: " " } as TextNode,
            {
                functionNodes: [{ functionIdentifier: "array" }, { functionIdentifier: "length" }] as FunctionNode[]
            } as FunctionParentNode,
            { text: "\n" } as TextNode,
            {
                fieldNodes: [{ fieldIdentifier: "array" }] as FieldNode[],
                fieldBodies: [
                    { functionNodes: [{ functionIdentifier: "index" }] as FunctionNode[] } as FunctionParentNode,
                    { text: ":" } as TextNode,
                    { text: " " } as TextNode,
                    {
                        fieldNodes: [{ fieldIdentifier: "package" }, { fieldIdentifier: "name" }] as FieldNode[]
                    } as FieldParentNode,
                    {
                        functionNodes: [{ functionIdentifier: "separator" }] as FunctionNode[],
                        functionBodies: [{ text: "\n" } as TextNode] as Node[]
                    } as FunctionParentNodeWithBody
                ] as Node
            } as FieldParentNodeWithBody
        ] as Node[]
    } as ParentNode);
});

test("argument parse1", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const analyzer = new Analyzer();
    const source = `$$function("Test",true,false,null,1,1.1)`;

    const parentNode = analyzer.analyze(parser.parseToken(lexer.analyzeToken(source)));

    expect(parentNode).toEqual({
        nodes: [
            {
                functionNodes: [{ functionIdentifier: "function" }] as FunctionNode[],
                functionArguments: [
                    { expression: [{ stringValue: "Test" } as StringNode] } as ExpressionNode,
                    {
                        expression: [{ booleanValue: true } as BooleanNode]
                    } as ExpressionNode,
                    {
                        expression: [{ booleanValue: false } as BooleanNode]
                    } as ExpressionNode,
                    {
                        expression: [{ nullValue: null } as NullNode]
                    } as ExpressionNode,
                    {
                        expression: [{ numberValue: 1 } as NumberNode]
                    } as ExpressionNode,
                    {
                        expression: [{ numberValue: 1.1 } as NumberNode]
                    } as ExpressionNode
                ] as ExpressionNode[]
            } as FunctionParentNodeWithArgument
        ] as Node[]
    } as ParentNode);
});

test("argument parse2", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const analyzer = new Analyzer();
    const source = `$$function(10+20*30)`;

    const parentNode = analyzer.analyze(parser.parseToken(lexer.analyzeToken(source)));

    expect(parentNode).toEqual({
        nodes: [
            {
                functionNodes: [{ functionIdentifier: "function" }] as FunctionNode[],
                functionArguments: [
                    {
                        expression: [
                            { operator: "+" } as OperatorNode,
                            { numberValue: 10 } as NumberNode,
                            {
                                expression: [
                                    { operator: "*" } as OperatorNode,
                                    { numberValue: 20 } as NumberNode,
                                    { numberValue: 30 } as NumberNode
                                ]
                            } as ExpressionNode
                        ]
                    } as ExpressionNode
                ] as ExpressionNode[]
            } as FunctionParentNodeWithArgument
        ] as Node[]
    } as ParentNode);
});

test("argument parse3", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const analyzer = new Analyzer();
    const source = `$$function(10+20*30*(10+20))`;

    const parentNode = analyzer.analyze(parser.parseToken(lexer.analyzeToken(source)));

    expect(parentNode).toEqual({
        nodes: [
            {
                functionNodes: [{ functionIdentifier: "function" }] as FunctionNode[],
                functionArguments: [
                    {
                        expression: [
                            { operator: "+" } as OperatorNode,
                            { numberValue: 10 } as NumberNode,
                            {
                                expression: [
                                    { operator: "*" } as OperatorNode,
                                    { numberValue: 20 } as NumberNode,
                                    {
                                        expression: [
                                            { operator: "*" } as OperatorNode,
                                            { numberValue: 30 } as NumberNode,
                                            {
                                                expression: [
                                                    { operator: "+" } as OperatorNode,
                                                    { numberValue: 10 } as NumberNode,
                                                    { numberValue: 20 } as NumberNode
                                                ]
                                            } as ExpressionNode
                                        ]
                                    } as ExpressionNode
                                ]
                            } as ExpressionNode
                        ]
                    } as ExpressionNode
                ] as ExpressionNode[]
            } as FunctionParentNodeWithArgument
        ] as Node[]
    } as ParentNode);
});
