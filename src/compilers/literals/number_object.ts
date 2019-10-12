import { Object } from "../object";
import { ObjectType } from "../object_type";
import { NumberNode } from "../../nodes/literal_node";

export class NumberObject implements Object {
    constructor(private numberNode: NumberNode) {}

    objectTypes(): ObjectType[] {
        return ["Number"];
    }

    executeString(): string {
        throw new Error("Method not implemented.");
    }

    executeBoolean(): boolean {
        throw new Error("Method not implemented.");
    }

    executeNumber(): number {
        return this.numberNode.numberValue;
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
