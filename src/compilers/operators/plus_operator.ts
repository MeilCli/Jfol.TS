import { Operator } from "../operator";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { FunctionParentNode } from "../../nodes/function_node";
import { FieldParentNode } from "../../nodes/field_node";
import { LiteralNode } from "../../nodes/literal_node";
import { ExpressionNode } from "../../nodes/expression_node";
import { Context } from "../context";

export class PlusOperator extends Operator {
    constructor(
        protected compilerPlugin: CompilerPlugin,
        context: Context,
        left: FunctionParentNode | FieldParentNode | LiteralNode | ExpressionNode,
        right: FunctionParentNode | FieldParentNode | LiteralNode | ExpressionNode
    ) {
        super(compilerPlugin, context, left, right);
    }

    objectTypes(): ObjectType[] {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return ["Number"];
        }
        return ["String"];
    }

    executeString(): string {
        let leftString: string;
        if (this.left.objectTypes().includes("String")) {
            leftString = this.left.executeString();
        } else if (this.left.objectTypes().includes("Boolean")) {
            leftString = String(this.left.executeBoolean());
        } else if (this.left.objectTypes().includes("Number")) {
            leftString = String(this.left.executeNumber());
        } else {
            leftString = String(this.left.executeNull());
        }

        let rightString: string;
        if (this.right.objectTypes().includes("String")) {
            rightString = this.right.executeString();
        } else if (this.right.objectTypes().includes("Boolean")) {
            rightString = String(this.right.executeBoolean());
        } else if (this.right.objectTypes().includes("Number")) {
            rightString = String(this.right.executeNumber());
        } else {
            rightString = String(this.right.executeNull());
        }

        return leftString + rightString;
    }

    executeBoolean(): boolean {
        throw new Error("Method not implemented.");
    }

    executeNumber(): number {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() + this.right.executeNumber();
        }
        throw new Error("Method not implemented.");
    }

    executeNull(): null {
        throw new Error("Method not implemented.");
    }
}
