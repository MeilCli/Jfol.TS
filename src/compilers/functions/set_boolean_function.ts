/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "../object";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class SetBooleanFunction extends Function {
    private name: Object;
    private value: Object;

    constructor(compilerPlugin: CompilerPlugin, private context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments == null || this.functionArguments.length != 2) {
            throw Error("set boolean function must have two arguments");
        }

        this.name = this.functionArguments[0];
        this.value = this.functionArguments[1];

        if (this.name.objectTypes().includes("String") == false) {
            throw Error("set boolean function first argumetn must be string");
        }
        if (this.value.objectTypes().includes("Boolean") == false) {
            throw Error("set boolean function second argumetn must be boolean");
        }

        if (this.functionBodies != null) {
            throw Error("set boolean function cannot have body");
        }
    }

    objectTypes(): ObjectType[] {
        return ["String", "Object"];
    }

    executeString(): string {
        this.context.setBoolean(this.name.executeString(), this.value.executeBoolean());
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
        this.context.setBoolean(this.name.executeString(), this.value.executeBoolean());
        return this.context.instance;
    }

    executeArray(): object[] {
        throw new Error("Method not implemented.");
    }
}
