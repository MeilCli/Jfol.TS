/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "../object";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class IfFunction extends Function {
    private condition: Object;

    constructor(compilerPlugin: CompilerPlugin, context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments == null || this.functionArguments.length != 1) {
            throw Error("if function must have single argument");
        }
        this.condition = this.functionArguments[0];
        if (this.condition.objectTypes().includes("Boolean") == false) {
            throw Error("if function argument must be boolean");
        }

        if (this.functionBodies == null) {
            throw Error("if function must have bodies");
        }
    }

    objectTypes(): ObjectType[] {
        return ["String"];
    }

    executeString(): string {
        let text = "";
        if (this.condition.executeBoolean()) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const body of this.functionBodies!) {
                text += body.executeString();
            }
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
