/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "../object";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode, isFunctionParentNode, FunctionParentNodeWithBody } from "../../nodes/function_node";
import { Context } from "../context";
import { isFieldParentNode } from "../../nodes/field_node";
import { isTextNode } from "../../nodes/text_node";

export class ParentFunction extends Function {
    private bodies: Object[];

    constructor(compilerPlugin: CompilerPlugin, context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments != null) {
            throw Error("parent function cannot have argument");
        }

        if (this.functionBodies == null) {
            throw Error("if function must have bodies");
        }

        const functionParentNodeWithBody = functionParentNode as FunctionParentNodeWithBody;
        this.bodies = functionParentNodeWithBody.functionBodies.map(x => {
            if (isFieldParentNode(x)) {
                return compilerPlugin.getFieldObject(context.getParent(), x);
            }
            if (isFunctionParentNode(x)) {
                return compilerPlugin.getFunctionObject(context.getParent(), x);
            }
            if (isTextNode(x)) {
                return compilerPlugin.getTextObject(x);
            }
            throw Error("internal compiler error, not found node");
        });
    }

    objectTypes(): ObjectType[] {
        return ["String"];
    }

    executeString(): string {
        let text = "";
        for (const body of this.bodies) {
            text += body.executeString();
        }
        return text;
    }

    executeBoolean(): boolean {
        throw new Error("Method not implemented.");
    }

    executeNumber(): number {
        throw new Error("Method not implemented.");
    }

    executeNull(): null {
        throw new Error("Method not implemented.");
    }

    executeObject(): object {
        throw new Error("Method not implemented.");
    }

    executeArray(): object[] {
        throw new Error("Method not implemented.");
    }
}
