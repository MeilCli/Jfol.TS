import { Node } from "./node";

export interface OperatorNode extends Node {
    readonly operator: Operator;
}

export type Operator = "==" | "!=" | "+" | "-" | "%" | "*" | "/" | "&&" | "||" | "<" | "<=" | ">" | ">=";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isOperatorNode(arg: any): arg is OperatorNode {
    return arg.operator !== undefined;
}
