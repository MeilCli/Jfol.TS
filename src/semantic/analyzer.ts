import { Node, ParentNode } from "../nodes/node";
import {
    FieldParentNode,
    isFieldParentNode,
    isFieldParentNodeWithBody,
    FieldParentNodeWithBody
} from "../nodes/field_node";

import {
    FunctionParentNode,
    FunctionParentNodeWithArgument,
    FunctionParentNodeWithBody,
    FunctionParentNodeWithArgumentAndBody,
    isFunctionParentNodeWithArgument,
    isFunctionParentNodeWithArgumentAndBody,
    isFunctionParentNode,
    isFunctionParentNodeWithBody
} from "../nodes/function_node";
import { OperatorNode, isOperatorNode } from "../nodes/operator_node";
import { LiteralNode, isLiteralNode } from "../nodes/literal_node";
import { ExpressionNode, isExpressionNode } from "../nodes/expression_node";

function operatorLevel(operatorNode: OperatorNode): number {
    switch (operatorNode.operator) {
        case "*":
        case "/":
        case "%":
            return 6;
        case "+":
        case "-":
            return 5;
        case "<":
        case "<=":
        case ">":
        case ">=":
            return 4;
        case "==":
        case "!=":
            return 3;
        case "&&":
            return 2;
        case "||":
            return 1;
        default:
            throw Error("internal operator level error");
    }
}

export class Analyzer {
    analyze(parentNode: ParentNode): ParentNode {
        const nodes: Node[] = [];

        for (const node of parentNode.nodes) {
            nodes.push(this.childAnalyze(node));
        }

        return { nodes: nodes } as ParentNode;
    }

    private childAnalyze(node: Node): Node {
        if (isFunctionParentNodeWithArgumentAndBody(node) == true) {
            const functionParentNode = node as FunctionParentNodeWithArgumentAndBody;
            const functionArguments: ExpressionNode[] = [];
            const functionBodies: Node[] = [];

            for (const functionArgument of functionParentNode.functionArguments) {
                functionArguments.push(this.convertToReversePolishNotation(functionArgument));
            }
            for (const functionBody of functionParentNode.functionBodies) {
                functionBodies.push(this.childAnalyze(functionBody));
            }

            return {
                functionNodes: functionParentNode.functionNodes,
                functionArguments: functionArguments,
                functionBodies: functionBodies
            } as FunctionParentNodeWithArgumentAndBody;
        }

        if (isFunctionParentNodeWithArgument(node) == true) {
            const functionParentNode = node as FunctionParentNodeWithArgument;
            const functionArguments: ExpressionNode[] = [];

            for (const functionArgument of functionParentNode.functionArguments) {
                functionArguments.push(this.convertToReversePolishNotation(functionArgument));
            }

            return {
                functionNodes: functionParentNode.functionNodes,
                functionArguments: functionArguments
            } as FunctionParentNodeWithArgument;
        }

        if (isFunctionParentNodeWithBody(node) == true) {
            const functionParentNode = node as FunctionParentNodeWithBody;
            const functionBodies: Node[] = [];

            for (const functionBody of functionParentNode.functionBodies) {
                functionBodies.push(this.childAnalyze(functionBody));
            }

            return {
                functionNodes: functionParentNode.functionNodes,
                functionBodies: functionBodies
            } as FunctionParentNodeWithBody;
        }

        if (isFieldParentNodeWithBody(node) == true) {
            const fieldParentNode = node as FieldParentNodeWithBody;
            const fieldBodies: Node[] = [];

            for (const fieldBody of fieldParentNode.fieldBodies) {
                fieldBodies.push(this.childAnalyze(fieldBody));
            }

            return {
                fieldNodes: fieldParentNode.fieldNodes,
                fieldBodies: fieldBodies
            } as FieldParentNodeWithBody;
        }

        return node;
    }

    // Result Format: Operator, Value, Value
    private convertToReversePolishNotation(expressionNode: ExpressionNode): ExpressionNode {
        if (expressionNode.expression.length == 1) {
            return expressionNode;
        }
        if (expressionNode.expression.length == 3) {
            return {
                expression: [expressionNode.expression[1], expressionNode.expression[0], expressionNode.expression[2]]
            } as ExpressionNode;
        }

        const operatorStack: OperatorNode[] = [];
        const reversePolishNotation: Array<
            FunctionParentNode | FieldParentNode | LiteralNode | ExpressionNode | OperatorNode
        > = [];

        for (const node of expressionNode.expression) {
            if (isFunctionParentNode(node) || isFieldParentNode(node) || isLiteralNode(node)) {
                reversePolishNotation.push(node);
            } else if (isExpressionNode(node)) {
                reversePolishNotation.push(this.convertToReversePolishNotation(node));
            } else if (isOperatorNode(node)) {
                const currentOperatorLevel = operatorLevel(node);
                let firstOperatorLevel: number;
                if (operatorStack.length != 0) {
                    firstOperatorLevel = operatorLevel(operatorStack[0]);
                } else {
                    firstOperatorLevel = 0; // min level
                }

                while (currentOperatorLevel < firstOperatorLevel) {
                    const tempOperator = operatorStack.shift();
                    if (tempOperator == undefined) {
                        break;
                    }
                    reversePolishNotation.push(tempOperator);

                    if (operatorStack.length != 0) {
                        firstOperatorLevel = operatorLevel(operatorStack[0]);
                    } else {
                        firstOperatorLevel = 0; // min level
                    }
                }
                operatorStack.unshift(node);
            } else {
                throw Error("internal parser error");
            }
        }
        for (const operator of operatorStack) {
            reversePolishNotation.push(operator);
        }

        const result: ExpressionNode = { expression: [] };
        for (const node of reversePolishNotation) {
            if (isOperatorNode(node) == false) {
                result.expression.unshift(node);
                continue;
            }

            // firstValue(a.k.a left) will be second on stack
            const secondValue = result.expression.shift();
            const firstValue = result.expression.shift();
            result.expression.unshift({ expression: [node, firstValue, secondValue] } as ExpressionNode);
        }

        // result will be single ExpressionNode
        if (result.expression.length != 1) {
            throw Error("internal analyzer error");
        }
        if (isExpressionNode(result.expression[0]) == false) {
            throw Error("internal analyzer error, cannot read reverse polish notation");
        }
        this.checkExpression(result.expression[0] as ExpressionNode);

        return result.expression[0] as ExpressionNode;
    }

    private checkExpression(expressionNode: ExpressionNode) {
        const isValueNode = (x: FieldParentNode | FunctionParentNode | LiteralNode | OperatorNode | ExpressionNode) => {
            return isFieldParentNode(x) || isFunctionParentNode(x) || isLiteralNode(x) || isExpressionNode(x);
        };

        if (expressionNode.expression.length == 1) {
            if (isValueNode(expressionNode.expression[0]) == false) {
                throw Error("internal analyzer error, not single value");
            }
            return;
        }
        if (expressionNode.expression.length != 3) {
            throw Error("internal analyzer error, not three elements");
        }

        const operator = expressionNode.expression[0];
        const firstValue = expressionNode.expression[1];
        const secondValue = expressionNode.expression[2];

        if (isOperatorNode(operator) == false) {
            throw Error("internal analyzer error, first expression element not be operator");
        }
        if (isValueNode(firstValue) == false) {
            throw Error("internal analyzer error, second expression element not be value");
        }
        if (isValueNode(secondValue) == false) {
            throw Error("internal analyzer error, third expression element not be value");
        }
        if (isExpressionNode(firstValue)) {
            this.checkExpression(firstValue);
        }
        if (isExpressionNode(secondValue)) {
            this.checkExpression(secondValue);
        }
    }
}
