/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "../object";
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class EvalFunction extends Function {
    private evalFunction: Object;

    constructor(compilerPlugin: CompilerPlugin, context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments == null || this.functionArguments.length != 1) {
            throw Error("eval function must have single argument");
        }
        this.evalFunction = this.functionArguments[0];

        if (this.functionBodies != null) {
            throw Error("eval function cannot have body");
        }
    }

    objectTypes(): ObjectType[] {
        return ["String"];
    }

    executeString(): string {
        if (this.evalFunction.objectTypes().includes("Number")) {
            return String(this.evalFunction.executeNumber());
        }
        if (this.evalFunction.objectTypes().includes("Boolean")) {
            return String(this.evalFunction.executeBoolean());
        }
        if (this.evalFunction.objectTypes().includes("Null")) {
            return String(this.evalFunction.executeNull());
        }
        return this.evalFunction.executeString();
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
