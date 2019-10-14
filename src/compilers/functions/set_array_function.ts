/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "../object";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class SetArrayFunction extends Function {
    private name: Object;
    private value: Object;

    constructor(compilerPlugin: CompilerPlugin, private context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments == null || this.functionArguments.length != 2) {
            throw Error("set array function must have two arguments");
        }

        this.name = this.functionArguments[0];
        this.value = this.functionArguments[1];

        if (this.name.objectTypes().includes("String") == false) {
            throw Error("set array function first argumetn must be string");
        }
        if (this.value.objectTypes().includes("Array") == false) {
            throw Error("set array function second argumetn must be array");
        }
    }

    private setArray() {
        const newArray = this.value.executeArray();
        const name = this.name.executeString();
        this.context.setObject(name, newArray);
    }

    objectTypes(): ObjectType[] {
        return ["String", "Array"];
    }

    executeString(): string {
        this.setArray();
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
        throw new Error("Method not implemented.");
    }

    executeArray(): object[] {
        this.setArray();
        return this.context.instance;
    }
}
