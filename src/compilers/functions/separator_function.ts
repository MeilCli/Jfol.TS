/* eslint-disable @typescript-eslint/ban-types */
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class SeparatorFunction extends Function {
    constructor(compilerPlugin: CompilerPlugin, context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments != null) {
            throw Error("separator function cannot have argument");
        }

        if (this.functionBodies == null) {
            throw Error("separator function must have bodies");
        }
    }

    objectTypes(): ObjectType[] {
        return ["String"];
    }

    executeString(): string {
        let text = "";
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const body of this.functionBodies!) {
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
}
