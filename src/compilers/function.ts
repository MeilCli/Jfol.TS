/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "./object";
import { ObjectType } from "./object_type";
import { CompilerPlugin } from "./compiler_plugin";
import {
    FunctionParentNode,
    isFunctionParentNode,
    isFunctionParentNodeWithArgument,
    isFunctionParentNodeWithBody
} from "../nodes/function_node";
import { isFieldParentNode } from "../nodes/field_node";
import { isTextNode } from "../nodes/text_node";
import { Context } from "./context";

export abstract class Function implements Object {
    protected functionIdentifires: string[];
    protected functionArguments: Object[] | null;
    protected functionBodies: Object[] | null;

    constructor(protected compilerPlugin: CompilerPlugin, context: Context, functionParentNode: FunctionParentNode) {
        this.functionIdentifires = functionParentNode.functionNodes.map(x => x.functionIdentifier);

        if (isFunctionParentNodeWithArgument(functionParentNode)) {
            this.functionArguments = functionParentNode.functionArguments.map(x =>
                compilerPlugin.getObject(context, x)
            );
        } else {
            this.functionArguments = null;
        }

        if (isFunctionParentNodeWithBody(functionParentNode)) {
            this.functionBodies = functionParentNode.functionBodies.map(x => {
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
            });
        } else {
            this.functionBodies = null;
        }
    }

    abstract objectTypes(): ObjectType[];
    abstract executeString(): string;
    abstract executeBoolean(): boolean;
    abstract executeNumber(): number;
    abstract executeNull(): null;
    abstract executeObject(): object;
    abstract executeArray(): object[];
}
