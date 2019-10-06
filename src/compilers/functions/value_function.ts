/* eslint-disable @typescript-eslint/ban-types */
import { ObjectType } from "../object_type";
import { CompilerPlugin } from "../compiler_plugin";
import { Function } from "../function";
import { FunctionParentNode } from "../../nodes/function_node";
import { Context } from "../context";

export class ValueFunction extends Function {
    constructor(compilerPlugin: CompilerPlugin, private context: Context, functionParentNode: FunctionParentNode) {
        super(compilerPlugin, context, functionParentNode);

        if (this.functionArguments != null) {
            throw Error("value function cannot have argument");
        }

        if (this.functionBodies != null) {
            throw Error("value function cannot have body");
        }
    }

    objectTypes(): ObjectType[] {
        if (this.context.inString()) {
            return ["String"];
        }
        if (this.context.inNumber()) {
            return ["Number", "String"];
        }
        if (this.context.inBoolean()) {
            return ["Boolean", "String"];
        }
        if (this.context.inNumber()) {
            return ["Null", "String"];
        }
        throw Error("internal compiler error, not handle type");
    }

    executeString(): string {
        if (this.context.inString()) {
            return String(this.context.json);
        }
        if (this.context.inBoolean()) {
            return String(this.context.json);
        }
        if (this.context.inNumber()) {
            return String(this.context.json);
        }
        if (this.context.inNull()) {
            return "null";
        }
        throw new Error("Method not implemented.");
    }

    executeBoolean(): boolean {
        if (this.context.inBoolean()) {
            return Boolean(this.context.json);
        }
        throw new Error("Method not implemented.");
    }

    executeNumber(): number {
        if (this.context.inNumber()) {
            return Number(this.context.json);
        }
        throw new Error("Method not implemented.");
    }

    executeNull(): null {
        if (this.context.inNull()) {
            return null;
        }
        throw new Error("Method not implemented.");
    }
}
