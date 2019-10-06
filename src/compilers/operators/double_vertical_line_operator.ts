import { Operator } from "../operator";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { FunctionParentNode } from "../../nodes/function_node";
import { FieldParentNode } from "../../nodes/field_node";
import { LiteralNode } from "../../nodes/literal_node";
import { ExpressionNode } from "../../nodes/expression_node";
import { Context } from "../context";

export class DoubleVerticalLineOperator extends Operator {
    constructor(
        protected compilerPlugin: CompilerPlugin,
        context: Context,
        left: FunctionParentNode | FieldParentNode | LiteralNode | ExpressionNode,
        right: FunctionParentNode | FieldParentNode | LiteralNode | ExpressionNode
    ) {
        super(compilerPlugin, context, left, right);
    }

    objectTypes(): ObjectType[] {
        return ["Boolean"];
    }

    executeString(): string {
        throw new Error("Method not implemented.");
    }

    executeBoolean(): boolean {
        if (this.left.objectTypes().includes("Boolean") && this.right.objectTypes().includes("Boolean")) {
            return this.left.executeBoolean() || this.right.executeBoolean();
        }
        throw new Error("Method not implemented.");
    }

    executeNumber(): number {
        throw new Error("Method not implemented.");
    }

    executeNull(): null {
        throw new Error("Method not implemented.");
    }
}
