/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "../object";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class SetNullFunction extends Function {
    private name: Object;

    constructor(compilerPlugin: CompilerPlugin, private context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments == null || this.functionArguments.length != 1) {
            throw Error("set null function must have single argument");
        }

        this.name = this.functionArguments[0];

        if (this.name.objectTypes().includes("String") == false) {
            throw Error("set null function first argumetn must be string");
        }

        if (this.functionBodies != null) {
            throw Error("set null function cannot have body");
        }
    }

    objectTypes(): ObjectType[] {
        return ["String", "Object"];
    }

    executeString(): string {
        this.context.setNull(this.name.executeString());
        return "";
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
        this.context.setNull(this.name.executeString());
        return this.context.instance;
    }

    executeArray(): object[] {
        throw new Error("Method not implemented.");
    }
}
