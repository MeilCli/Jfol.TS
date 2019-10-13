/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "../object";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class SetNumberFunction extends Function {
    private name: Object;
    private value: Object;

    constructor(compilerPlugin: CompilerPlugin, private context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments == null || this.functionArguments.length != 2) {
            throw Error("set number function must have two arguments");
        }

        this.name = this.functionArguments[0];
        this.value = this.functionArguments[1];

        if (this.name.objectTypes().includes("String") == false) {
            throw Error("set number function first argumetn must be string");
        }
        if (this.value.objectTypes().includes("Number") == false) {
            throw Error("set number function second argumetn must be number");
        }

        if (this.functionBodies != null) {
            throw Error("set number function cannot have body");
        }
    }

    objectTypes(): ObjectType[] {
        return ["String", "Object"];
    }

    executeString(): string {
        this.context.setNumber(this.name.executeString(), this.value.executeNumber());
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
        this.context.setNumber(this.name.executeString(), this.value.executeNumber());
        return this.context.instance;
    }

    executeArray(): object[] {
        throw new Error("Method not implemented.");
    }
}
