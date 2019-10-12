/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "./object";
import { ObjectType } from "./object_type";
import { CompilerPlugin } from "./compiler_plugin";
import { FunctionParentNode, isFunctionParentNode } from "../nodes/function_node";
import { FieldParentNode, isFieldParentNode } from "../nodes/field_node";
import { LiteralNode, isLiteralNode } from "../nodes/literal_node";
import { ExpressionNode } from "../nodes/expression_node";
import { Context } from "./context";

export abstract class Operator implements Object {
    protected left: Object;
    protected right: Object;

    constructor(
        protected compilerPlugin: CompilerPlugin,
        context: Context,
        left: FunctionParentNode | FieldParentNode | LiteralNode | ExpressionNode,
        right: FunctionParentNode | FieldParentNode | LiteralNode | ExpressionNode
    ) {
        if (isFunctionParentNode(left)) {
            this.left = compilerPlugin.getFunctionObject(context, left);
        } else if (isFieldParentNode(left)) {
            this.left = compilerPlugin.getFieldObject(context, left);
        } else if (isLiteralNode(left)) {
            this.left = compilerPlugin.getLiteralObject(left);
        } else {
            this.left = compilerPlugin.getOperatorObject(context, left);
        }

        if (isFunctionParentNode(right)) {
            this.right = compilerPlugin.getFunctionObject(context, right);
        } else if (isFieldParentNode(right)) {
            this.right = compilerPlugin.getFieldObject(context, right);
        } else if (isLiteralNode(right)) {
            this.right = compilerPlugin.getLiteralObject(right);
        } else {
            this.right = compilerPlugin.getOperatorObject(context, right);
        }
    }

    abstract objectTypes(): ObjectType[];
    abstract executeString(): string;
    abstract executeBoolean(): boolean;
    abstract executeNumber(): number;
    abstract executeNull(): null;
    abstract executeObject(): object;
    abstract executeArray(): object[];
}
