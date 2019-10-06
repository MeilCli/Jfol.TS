/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "./object";
import { ObjectType } from "./object_type";
import { CompilerPlugin } from "./compiler_plugin";
import { isFunctionParentNode } from "../nodes/function_node";
import {
    FieldParentNode,
    isFieldParentNode,
    isFieldParentNodeWithBody,
    FieldParentNodeWithBody
} from "../nodes/field_node";
import { isTextNode } from "../nodes/text_node";
import { Context } from "./context";
import { SeparatorFunction } from "./functions/separator_function";
import { WhereFunction } from "./functions/where_function";

export class Field implements Object {
    private identifier: string;
    private fieldBodies: Object[] | null;

    // for array
    private index = 0;
    private fieldParentNodeWithBody: FieldParentNodeWithBody | null = null;
    private separatorFunction: SeparatorFunction | null = null;
    private whereFunction: WhereFunction | null = null;

    constructor(private compilerPlugin: CompilerPlugin, private context: Context, fieldParentNode: FieldParentNode) {
        if (fieldParentNode.fieldNodes.length == 0) {
            this.identifier = "";
        } else {
            this.identifier = fieldParentNode.fieldNodes[fieldParentNode.fieldNodes.length - 1].fieldIdentifier;
        }

        if (isFieldParentNodeWithBody(fieldParentNode)) {
            if (context.isObject(this.identifier)) {
                const nestedContext = context.getObject(this.identifier);
                this.fieldBodies = this.getFieldBodiesInObject(compilerPlugin, nestedContext, fieldParentNode);
            } else {
                this.fieldBodies = null;
                this.fieldParentNodeWithBody = fieldParentNode;
            }
        } else {
            this.fieldBodies = null;
        }
    }

    private getFieldBodiesInObject(
        compilerPlugin: CompilerPlugin,
        context: Context,
        fieldParentNodeWithBody: FieldParentNodeWithBody
    ): Object[] {
        return fieldParentNodeWithBody.fieldBodies
            .map(x => {
                if (isFieldParentNode(x)) {
                    return compilerPlugin.getFieldObject(context, x);
                }
                if (isFunctionParentNode(x)) {
                    return compilerPlugin.getFunctionObject(context, x);
                }
                if (isTextNode(x)) {
                    return compilerPlugin.getTextObject(x);
                }
                throw Error("internal compiler error, not found node");
            })
            .filter(x => {
                if (x instanceof SeparatorFunction || x instanceof WhereFunction) {
                    return false;
                }
                return true;
            });
    }

    private hasNextInArray(): boolean {
        return this.index < this.context.getArray(this.identifier).getNumber("length");
    }

    private applyCurrentFieldBodiesInArray() {
        if (this.fieldParentNodeWithBody == null) {
            throw Error("internal compiler error, array field");
        }

        let nestedContext: Context;
        if (this.identifier.length == 0) {
            nestedContext = this.context.getObject(this.index);
        } else {
            nestedContext = this.context.getObject(this.identifier).getObject(this.index);
        }

        this.fieldBodies = this.fieldParentNodeWithBody.fieldBodies
            .map(x => {
                if (isFieldParentNode(x)) {
                    return this.compilerPlugin.getFieldObject(nestedContext, x);
                }
                if (isFunctionParentNode(x)) {
                    return this.compilerPlugin.getFunctionObject(nestedContext, x);
                }
                if (isTextNode(x)) {
                    return this.compilerPlugin.getTextObject(x);
                }
                throw Error("internal compiler error, not found node");
            })
            .filter(x => {
                if (x instanceof SeparatorFunction) {
                    this.separatorFunction = x;
                    return false;
                }
                if (x instanceof WhereFunction) {
                    this.whereFunction = x;
                    return false;
                }
                return true;
            });
    }

    objectTypes(): ObjectType[] {
        if (
            this.context.isArray(this.identifier) ||
            this.context.isObject(this.identifier) ||
            this.context.isString(this.identifier)
        ) {
            return ["String"];
        }
        if (this.context.isNumber(this.identifier)) {
            return ["Number", "String"];
        }
        if (this.context.isBoolean(this.identifier)) {
            return ["Boolean", "String"];
        }
        if (this.context.isNull(this.identifier)) {
            return ["Null", "String"];
        }
        throw new Error("Method not implemented.");
    }

    executeString(): string {
        if (this.fieldBodies == null && this.context.isArray(this.identifier) == false) {
            return this.context.getString(this.identifier);
        }

        if (this.fieldBodies != null && this.context.isObject(this.identifier)) {
            let text = "";

            for (const body of this.fieldBodies) {
                text += body.executeString();
            }

            return text;
        }

        let text = "";

        while (this.hasNextInArray()) {
            this.applyCurrentFieldBodiesInArray();
            if (this.whereFunction != null && this.whereFunction.executeBoolean() == false) {
                this.index += 1;
                continue;
            }
            if (this.separatorFunction != null && 0 < text.length) {
                text += this.separatorFunction.executeString();
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const body of this.fieldBodies!) {
                text += body.executeString();
            }

            this.index += 1;
        }

        return text;
    }

    executeBoolean(): boolean {
        return this.context.getBoolean(this.identifier);
    }

    executeNumber(): number {
        return this.context.getNumber(this.identifier);
    }

    executeNull(): null {
        return null;
    }
}
