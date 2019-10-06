import { ObjectType } from "./object_type";

export interface Object {
    objectTypes(): ObjectType[];
    executeString(): string;
    executeBoolean(): boolean;
    executeNumber(): number;
    executeNull(): null;
}
