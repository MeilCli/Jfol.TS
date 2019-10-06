/* eslint-disable @typescript-eslint/ban-types */
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class NumberFunction extends Function {
    constructor(compilerPlugin: CompilerPlugin, private context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments != null) {
            throw Error("number function cannot have argument");
        }

        if (this.functionBodies != null) {
            throw Error("number function cannot have body");
        }
    }

    objectTypes(): ObjectType[] {
        return ["Number", "String"];
    }

    executeString(): string {
        return String(this.context.index + 1);
    }

    executeBoolean(): boolean {
        throw new Error("Method not implemented.");
    }

    executeNumber(): number {
        return this.context.index + 1;
    }

    executeNull(): null {
        throw new Error("Method not implemented.");
    }
}
