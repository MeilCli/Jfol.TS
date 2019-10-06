import { Node } from "./node";
import { ExpressionNode } from "./expression_node";

export interface FunctionNode extends Node {
    readonly functionIdentifier: string;
}

export interface FunctionParentNode extends Node {
    readonly functionNodes: FunctionNode[];
}

export interface FunctionParentNodeWithArgument extends FunctionParentNode {
    readonly functionArguments: ExpressionNode[];
}

export interface FunctionParentNodeWithBody extends FunctionParentNode {
    readonly functionBodies: Node[];
}

export interface FunctionParentNodeWithArgumentAndBody
    extends FunctionParentNodeWithArgument,
        FunctionParentNodeWithBody {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFunctionNode(arg: any): arg is FunctionNode {
    return arg.functionIdentifier !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFunctionParentNode(arg: any): arg is FunctionParentNode {
    return arg.functionNodes !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFunctionParentNodeWithArgument(arg: any): arg is FunctionParentNodeWithArgument {
    return arg.functionNodes !== undefined && arg.functionArguments !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFunctionParentNodeWithBody(arg: any): arg is FunctionParentNodeWithBody {
    return arg.functionNodes !== undefined && arg.functionBodies !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFunctionParentNodeWithArgumentAndBody(arg: any): arg is FunctionParentNodeWithArgumentAndBody {
    return arg.functionNodes !== undefined && arg.functionArguments !== undefined && arg.functionBodies !== undefined;
}
