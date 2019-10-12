import { Object } from "../object";
import { ObjectType } from "../object_type";
import { NullNode } from "../../nodes/literal_node";

export class NullObject implements Object {
    constructor(private nullNode: NullNode) {}

    objectTypes(): ObjectType[] {
        return ["Null"];
    }

    executeString(): string {
        throw new Error("Method not implemented.");
    }

    executeBoolean(): boolean {
        throw new Error("Method not implemented.");
    }

    executeNumber(): number {
        throw new Error("Method not implemented.");
    }

    executeNull(): null {
        return this.nullNode.nullValue;
    }

    executeObject(): object {
        throw new Error("Method not implemented.");
    }

    executeArray(): object[] {
        throw new Error("Method not implemented.");
    }
}
