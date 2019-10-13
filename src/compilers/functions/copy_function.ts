/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "../object";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepCopy(source: any): any {
    if (typeof source != "object") {
        return source;
    }
    if (Array.isArray(source)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const array: any[] = [];
        for (const element of source) {
            array.push(deepCopy(element));
        }
        return array;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    for (const key in source) {
        const value = source[key];
        if (typeof value == "object") {
            result[key] = deepCopy(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

export class CopyFunction extends Function {
    private name: Object;
    private value: Object;

    constructor(compilerPlugin: CompilerPlugin, private context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments == null || this.functionArguments.length != 2) {
            throw Error("copy function must have two arguments");
        }

        this.name = this.functionArguments[0];
        this.value = this.functionArguments[1];

        if (this.name.objectTypes().includes("String") == false) {
            throw Error("copy function first argumetn must be string");
        }
    }

    private copy() {
        if (this.value.objectTypes().includes("Object")) {
            this.context.setObject(this.name.executeString(), deepCopy(this.value.executeObject()));
            return;
        }
        if (this.value.objectTypes().includes("Array")) {
            this.context.setObject(this.name.executeString(), deepCopy(this.value.executeArray()));
        }
        if (this.value.objectTypes().includes("Boolean")) {
            this.context.setBoolean(this.name.executeString(), this.value.executeBoolean());
            return;
        }
        if (this.value.objectTypes().includes("Number")) {
            this.context.setNumber(this.name.executeString(), this.value.executeNumber());
            return;
        }
        if (this.value.objectTypes().includes("Null")) {
            this.context.setNull(this.name.executeString());
            return;
        }
        this.context.setString(this.name.executeString(), this.value.executeString());
    }

    objectTypes(): ObjectType[] {
        return ["String"];
    }

    executeString(): string {
        this.copy();
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
        throw new Error("Method not implemented.");
    }
}
