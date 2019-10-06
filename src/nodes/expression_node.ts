import { Node } from "./node";
import { FieldParentNode } from "./field_node";
import { FunctionParentNode } from "./function_node";
import { LiteralNode } from "./literal_node";
import { OperatorNode } from "./operator_node";

export interface ExpressionNode extends Node {
    readonly expression: Array<FieldParentNode | FunctionParentNode | LiteralNode | OperatorNode | ExpressionNode>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isExpressionNode(arg: any): arg is ExpressionNode {
    return arg.expression !== undefined;
}
