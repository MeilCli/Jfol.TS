/* eslint-disable @typescript-eslint/ban-types */
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class IndexFunction extends Function {
    constructor(compilerPlugin: CompilerPlugin, private context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments != null) {
            throw Error("index function cannot have argument");
        }

        if (this.functionBodies != null) {
            throw Error("index function cannot have body");
        }
    }

    objectTypes(): ObjectType[] {
        return ["Number", "String"];
    }

    executeString(): string {
        return String(this.context.index);
    }

    executeBoolean(): boolean {
        throw new Error("Method not implemented.");
    }

    executeNumber(): number {
        return this.context.index;
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
