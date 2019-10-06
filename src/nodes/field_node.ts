import { Node } from "./node";

export interface FieldNode extends Node {
    readonly fieldIdentifier: string;
}

export interface FieldParentNode extends Node {
    readonly fieldNodes: FieldNode[];
}

export interface FieldParentNodeWithBody extends FieldParentNode {
    readonly fieldBodies: Node[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFieldNode(arg: any): arg is FieldNode {
    return arg.fieldIdentifier !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFieldParentNode(arg: any): arg is FieldParentNode {
    return arg.fieldNodes !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFieldParentNodeWithBody(arg: any): arg is FieldParentNodeWithBody {
    return arg.fieldBodies !== undefined;
}
