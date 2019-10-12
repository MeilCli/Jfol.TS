import { Object } from "../object";
import { ObjectType } from "../object_type";
import { BooleanNode } from "../../nodes/literal_node";

export class BooleanObject implements Object {
    constructor(private booleanNode: BooleanNode) {}

    objectTypes(): ObjectType[] {
        return ["Boolean"];
    }

    executeString(): string {
        throw new Error("Method not implemented.");
    }

    executeBoolean(): boolean {
        return this.booleanNode.booleanValue;
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
