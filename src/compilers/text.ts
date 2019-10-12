/* eslint-disable @typescript-eslint/ban-types */
import { Object } from "./object";
import { ObjectType } from "./object_type";
import { TextNode } from "../nodes/text_node";

export class TextObject implements Object {
    constructor(private textNode: TextNode) {}

    objectTypes(): ObjectType[] {
        return ["String"];
    }

    executeString(): string {
        return this.textNode.text;
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
