// eslint-disable-next-line prettier/prettier, @typescript-eslint/no-empty-interface
export interface Node {}

export interface ParentNode extends Node {
    readonly nodes: Node[];
}
