/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "./object";
import { Function } from "./function";
import { Context } from "./context";
import { Node } from "../nodes/node";
import { FunctionParentNode, isFunctionParentNode } from "../nodes/function_node";
import { FieldParentNode, isFieldParentNode } from "../nodes/field_node";
import {
    LiteralNode,
    isStringNode,
    isBooleanNode,
    isNumberNode,
    isNullNode,
    isLiteralNode
} from "../nodes/literal_node";
import { OperatorNode } from "../nodes/operator_node";
import { ExpressionNode, isExpressionNode } from "../nodes/expression_node";
import { TextNode, isTextNode } from "../nodes/text_node";
import { StringObject } from "./literals/string_object";
import { BooleanObject } from "./literals/boolean_object";
import { NumberObject } from "./literals/number_object";
import { NullObject } from "./literals/null_object";
import { EqualOperator } from "./operators/equal_operator";
import { NotEqualOperator } from "./operators/not_equal_operator";
import { PlusOperator } from "./operators/plus_operator";
import { MinusOperator } from "./operators/minus_operator";
import { PercentOperator } from "./operators/percent_operator";
import { AsteriskOperator } from "./operators/asterisk_operator";
import { SlashOperator } from "./operators/slash_operator";
import { DoubleAmpersandOperator } from "./operators/double_ampersand_operator";
import { DoubleVerticalLineOperator } from "./operators/double_vertical_line_operator";
import { LessThanOperator } from "./operators/less_than_operator";
import { LessThanOrEqualOperator } from "./operators/less_than_or_equal_operator";
import { GreaterThanOperator } from "./operators/greater_than_operator";
import { GreaterThanOrEqualOperator } from "./operators/greater_than_or_equal_operator";
import { TextObject } from "./text";
import { Field } from "./field";

export abstract class CompilerPlugin {
    abstract functions: Array<[string, (arg0: Context, arg1: FunctionParentNode) => Function]>;

    getObject(context: Context, node: Node): Object {
        if (isTextNode(node)) {
            return this.getTextObject(node);
        }
        if (isFunctionParentNode(node)) {
            return this.getFunctionObject(context, node);
        }
        if (isFieldParentNode(node)) {
            return this.getFieldObject(context, node);
        }
        if (isExpressionNode(node)) {
            if (node.expression.length == 1) {
                return this.getObject(context, node.expression[0]);
            }
            return this.getOperatorObject(context, node);
        }
        if (isLiteralNode(node)) {
            return this.getLiteralObject(node);
        }

        throw Error("internal compiler error, cannot handle node");
    }

    getFunctionObject(context: Context, functionParentNode: FunctionParentNode): Object {
        if (functionParentNode.functionNodes.length < 1) {
            throw Error("internal compiler error, must have function identifier");
        }

        const executeContext = this.nestedContext(
            context,
            functionParentNode.functionNodes.map(x => x.functionIdentifier)
        );
        const functionIdentifier =
            functionParentNode.functionNodes[functionParentNode.functionNodes.length - 1].functionIdentifier;

        for (const functionObject of this.functions) {
            if (functionObject[0] == functionIdentifier) {
                return functionObject[1](executeContext, functionParentNode);
            }
        }

        throw Error("Not found function");
    }

    getFieldObject(context: Context, fieldParentNode: FieldParentNode): Object {
        const executeContext = this.nestedContext(context, fieldParentNode.fieldNodes.map(x => x.fieldIdentifier));
        return new Field(this, executeContext, fieldParentNode);
    }

    private nestedContext(context: Context, identifiers: string[]): Context {
        if (identifiers.length < 1) {
            return context;
        }

        let nestedContext = context;
        for (let i = 0; i < identifiers.length - 1; i++) {
            nestedContext = context.getObject(identifiers[i]);
        }

        return nestedContext;
    }

    getTextObject(textNode: TextNode): Object {
        return new TextObject(textNode);
    }

    getLiteralObject(literalNode: LiteralNode): Object {
        if (isStringNode(literalNode)) {
            return new StringObject(literalNode);
        } else if (isBooleanNode(literalNode)) {
            return new BooleanObject(literalNode);
        } else if (isNumberNode(literalNode)) {
            return new NumberObject(literalNode);
        } else if (isNullNode(literalNode)) {
            return new NullObject(literalNode);
        }
        throw new Error("Method not implemented.");
    }

    getOperatorObject(context: Context, expressionNode: ExpressionNode): Object {
        switch ((expressionNode.expression[0] as OperatorNode).operator) {
            case "==":
                return new EqualOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "!=":
                return new NotEqualOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "+":
                return new PlusOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "-":
                return new MinusOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "%":
                return new PercentOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "*":
                return new AsteriskOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "/":
                return new SlashOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "&&":
                return new DoubleAmpersandOperator(
                    this,
                    context,
                    expressionNode.expression[1],
                    expressionNode.expression[2]
                );
            case "||":
                return new DoubleVerticalLineOperator(
                    this,
                    context,
                    expressionNode.expression[1],
                    expressionNode.expression[2]
                );
            case "<":
                return new LessThanOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "<=":
                return new LessThanOrEqualOperator(
                    this,
                    context,
                    expressionNode.expression[1],
                    expressionNode.expression[2]
                );
            case ">":
                return new GreaterThanOperator(
                    this,
                    context,
                    expressionNode.expression[1],
                    expressionNode.expression[2]
                );
            case ">=":
                return new GreaterThanOrEqualOperator(
                    this,
                    context,
                    expressionNode.expression[1],
                    expressionNode.expression[2]
                );
        }
        throw Error("internal compiler error, not found operator");
    }
}
