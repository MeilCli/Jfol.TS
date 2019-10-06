/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "../object";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class WhereFunction extends Function {
    private condition: Object;

    constructor(compilerPlugin: CompilerPlugin, context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments == null || this.functionArguments.length != 1) {
            throw Error("where function must have single argument");
        }
        this.condition = this.functionArguments[0];
        if (this.condition.objectTypes().includes("Boolean") == false) {
            throw Error("where function argument must be boolean");
        }

        if (this.functionBodies != null) {
            throw Error("where function cannot have body");
        }
    }

    objectTypes(): ObjectType[] {
        return ["Boolean"];
    }

    executeString(): string {
        throw new Error("Method not implemented.");
    }

    executeBoolean(): boolean {
        return this.condition.executeBoolean();
    }

    executeNumber(): number {
        throw new Error("Method not implemented.");
    }

    executeNull(): null {
        throw new Error("Method not implemented.");
    }
}
