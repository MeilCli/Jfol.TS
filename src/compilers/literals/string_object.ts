import { Object } from "../object";
import { ObjectType } from "../object_type";
import { StringNode } from "../../nodes/literal_node";

export class StringObject implements Object {
    constructor(private stringNode: StringNode) {}

    objectTypes(): ObjectType[] {
        return ["String"];
    }

    executeString(): string {
        return this.stringNode.stringValue;
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
}
