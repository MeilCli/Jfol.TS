/* eslint-disable @typescript-eslint/ban-types */
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class LengthFunction extends Function {
    constructor(compilerPlugin: CompilerPlugin, private context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments != null) {
            throw Error("length function cannot have argument");
        }

        if (this.functionBodies != null) {
            throw Error("length function cannot have body");
        }
    }

    objectTypes(): ObjectType[] {
        return ["Number", "String"];
    }

    executeString(): string {
        if (this.context.inArray() == false) {
            return String(this.context.length);
        }
        return String(this.context.getNumber("length"));
    }

    executeBoolean(): boolean {
        throw new Error("Method not implemented.");
    }

    executeNumber(): number {
        if (this.context.inArray() == false) {
            return this.context.length;
        }
        return this.context.getNumber("length");
    }

    executeNull(): null {
        throw new Error("Method not implemented.");
    }
}
