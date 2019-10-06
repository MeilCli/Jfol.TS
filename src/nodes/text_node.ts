import { Node } from "./node";

export interface TextNode extends Node {
    readonly text: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTextNode(arg: any): arg is TextNode {
    return arg.text !== undefined;
}
