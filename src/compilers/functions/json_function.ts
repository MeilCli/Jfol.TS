/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "../object";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class JsonFunction extends Function {
    private instance: Object | null;

    constructor(compilerPlugin: CompilerPlugin, private context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments != null && this.functionArguments.length != 1) {
            throw Error("json function must have single or empty argument");
        }
        if (this.functionArguments != null) {
            this.instance = this.functionArguments[0];
            if (
                this.instance.objectTypes().includes("Object") == false &&
                this.instance.objectTypes().includes("Array") == false
            ) {
                throw Error("json function's argument must be object or array");
            }
        } else {
            this.instance = null;
        }

        if (this.functionBodies != null) {
            throw Error("json function cannot have body");
        }
    }

    objectTypes(): ObjectType[] {
        return ["String"];
    }

    executeString(): string {
        if (this.instance == null) {
            return JSON.stringify(this.context.instance, null, 4);
        }
        if (this.instance.objectTypes().includes("Array")) {
            return JSON.stringify(this.instance.executeArray(), null, 4);
        }
        return JSON.stringify(this.instance.executeObject(), null, 4);
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
