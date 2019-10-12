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
