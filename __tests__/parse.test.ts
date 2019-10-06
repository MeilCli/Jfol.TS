import { Lexer } from "../src/lexers/lexer";
import { Parser } from "../src/ast/parser";
import { Node, ParentNode } from "../src/nodes/node";
import { TextNode } from "../src/nodes/text_node";
import { FieldNode, FieldParentNode, FieldParentNodeWithBody } from "../src/nodes/field_node";
import {
    FunctionNode,
    FunctionParentNode,
    FunctionParentNodeWithArgument,
    FunctionParentNodeWithBody,
    FunctionParentNodeWithArgumentAndBody
} from "../src/nodes/function_node";
import { StringNode, BooleanNode, NumberNode, NullNode } from "../src/nodes/literal_node";
import { OperatorNode } from "../src/nodes/operator_node";
import { ExpressionNode } from "../src/nodes/expression_node";

test("simple parse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = "Packages Total: $$(array.length)\n$array[$$index: $(package.name)$$separator[\n]]";

    const parentNode = parser.parseToken(lexer.analyzeToken(source));

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

test("field body parse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = "$array[$value]";

    const parentNode = parser.parseToken(lexer.analyzeToken(source));

    expect(parentNode).toEqual({
        nodes: [
            {
                fieldNodes: [{ fieldIdentifier: "array" }] as FieldNode[],
                fieldBodies: [
                    { fieldNodes: [{ fieldIdentifier: "value" }] as FieldNode[] } as FieldParentNode
                ] as Node[]
            } as FieldParentNodeWithBody
        ] as Node[]
    } as ParentNode);
});

test("field body with no identifier parse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = "$[$value]";

    const parentNode = parser.parseToken(lexer.analyzeToken(source));

    expect(parentNode).toEqual({
        nodes: [
            {
                fieldNodes: [] as FieldNode[],
                fieldBodies: [
                    { fieldNodes: [{ fieldIdentifier: "value" }] as FieldNode[] } as FieldParentNode
                ] as Node[]
            } as FieldParentNodeWithBody
        ] as Node[]
    } as ParentNode);
});

test("field body with inner function parse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = "$array[$value$$separator[\n]]";

    const parentNode = parser.parseToken(lexer.analyzeToken(source));

    expect(parentNode).toEqual({
        nodes: [
            {
                fieldNodes: [{ fieldIdentifier: "array" }] as FieldNode[],
                fieldBodies: [
                    { fieldNodes: [{ fieldIdentifier: "value" }] as FieldNode[] } as FieldParentNode,
                    {
                        functionNodes: [{ functionIdentifier: "separator" }] as FunctionNode[],
                        functionBodies: [{ text: "\n" } as TextNode] as Node[]
                    } as FunctionParentNodeWithBody
                ] as Node[]
            } as FieldParentNodeWithBody
        ] as Node[]
    } as ParentNode);
});

test("function argument parse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = "$$function($value)";

    const parentNode = parser.parseToken(lexer.analyzeToken(source));

    expect(parentNode).toEqual({
        nodes: [
            {
                functionNodes: [{ functionIdentifier: "function" }] as FunctionNode[],
                functionArguments: [
                    {
                        expression: [
                            {
                                fieldNodes: [{ fieldIdentifier: "value" }] as FieldNode[]
                            } as FieldParentNode
                        ]
                    } as ExpressionNode
                ] as ExpressionNode[]
            } as FunctionParentNodeWithArgument
        ] as Node[]
    } as ParentNode);
});

test("function argument and body parse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = "$$function($value)[$value]";

    const parentNode = parser.parseToken(lexer.analyzeToken(source));

    expect(parentNode).toEqual({
        nodes: [
            {
                functionNodes: [{ functionIdentifier: "function" }] as FunctionNode[],
                functionArguments: [
                    {
                        expression: [
                            {
                                fieldNodes: [{ fieldIdentifier: "value" }] as FieldNode[]
                            } as FieldParentNode
                        ]
                    } as ExpressionNode
                ] as ExpressionNode[],
                functionBodies: [
                    { fieldNodes: [{ fieldIdentifier: "value" }] as FieldNode[] } as FieldParentNode
                ] as Node[]
            } as FunctionParentNodeWithArgumentAndBody
        ] as Node[]
    } as ParentNode);
});

test("function multiple arguments parse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = "$$function(true,1*(2+3*(1+3)))";

    const parentNode = parser.parseToken(lexer.analyzeToken(source));

    expect(parentNode).toEqual({
        nodes: [
            {
                functionNodes: [{ functionIdentifier: "function" }] as FunctionNode[],
                functionArguments: [
                    {
                        expression: [{ booleanValue: true } as BooleanNode]
                    } as ExpressionNode,
                    {
                        expression: [
                            { numberValue: 1 } as NumberNode,
                            { operator: "*" } as OperatorNode,
                            {
                                expression: [
                                    { numberValue: 2 } as NumberNode,
                                    { operator: "+" } as OperatorNode,
                                    { numberValue: 3 } as NumberNode,
                                    { operator: "*" } as OperatorNode,
                                    {
                                        expression: [
                                            { numberValue: 1 } as NumberNode,
                                            { operator: "+" } as OperatorNode,
                                            { numberValue: 3 } as NumberNode
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

test("string literal parse - no literal", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = `"$$function($value)"`;

    const parentNode = parser.parseToken(lexer.analyzeToken(source));

    expect(parentNode).toEqual({
        nodes: [{ text: "$$function($value)" } as TextNode] as Node[]
    } as ParentNode);
});

test("literal parse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = `$$function("Test",true,false,null,1,1.1)`;

    const parentNode = parser.parseToken(lexer.analyzeToken(source));

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

test("operator parse", () => {
    const lexer = new Lexer();
    const parser = new Parser();
    const source = `$$function(true&&true,true!=false,1==1.1)`;

    const parentNode = parser.parseToken(lexer.analyzeToken(source));

    expect(parentNode).toEqual({
        nodes: [
            {
                functionNodes: [{ functionIdentifier: "function" }] as FunctionNode[],
                functionArguments: [
                    {
                        expression: [
                            { booleanValue: true } as BooleanNode,
                            { operator: "&&" } as OperatorNode,
                            { booleanValue: true } as BooleanNode
                        ]
                    } as ExpressionNode,
                    {
                        expression: [
                            { booleanValue: true } as BooleanNode,
                            { operator: "!=" } as OperatorNode,
                            { booleanValue: false } as BooleanNode
                        ]
                    } as ExpressionNode,
                    {
                        expression: [
                            { numberValue: 1 } as NumberNode,
                            { operator: "==" } as OperatorNode,
                            { numberValue: 1.1 } as NumberNode
                        ]
                    } as ExpressionNode
                ] as ExpressionNode[]
            } as FunctionParentNodeWithArgument
        ] as Node[]
    } as ParentNode);
});
