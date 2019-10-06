import { Node } from "./node";

// eslint-disable-next-line prettier/prettier, @typescript-eslint/no-empty-interface
export interface LiteralNode extends Node {}

export interface StringNode extends LiteralNode {
    readonly stringValue: string;
}

export interface BooleanNode extends LiteralNode {
    readonly booleanValue: boolean;
}

export interface NumberNode extends LiteralNode {
    readonly numberValue: number;
}

export interface NullNode extends LiteralNode {
    /* always null, this field's reason is only for type handle*/
    readonly nullValue: null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isStringNode(arg: any): arg is StringNode {
    return arg.stringValue !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isBooleanNode(arg: any): arg is BooleanNode {
    return arg.booleanValue !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNumberNode(arg: any): arg is NumberNode {
    return arg.numberValue !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNullNode(arg: any): arg is NullNode {
    return arg.nullValue !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isLiteralNode(arg: any): arg is LiteralNode {
    return isStringNode(arg) || isBooleanNode(arg) || isNumberNode(arg) || isNullNode(arg);
}
