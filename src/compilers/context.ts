export class Context {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(public json: any, public index = 0, public length = 0) {}

    inString(): boolean {
        return typeof this.json == "string";
    }

    inNumber(): boolean {
        return typeof this.json == "number";
    }

    inBoolean(): boolean {
        return typeof this.json == "boolean";
    }

    inNull(): boolean {
        return typeof this.json == "object" && this.json == null;
    }

    inObject(): boolean {
        return typeof this.json == "object" && this.json != null && Array.isArray(this.json) == false;
    }

    inArray(): boolean {
        return typeof this.json == "object" && Array.isArray(this.json);
    }

    isString(nameOrIndex: string | number): boolean {
        return nameOrIndex in this.json && typeof this.json[nameOrIndex] == "string";
    }

    getString(nameOrIndex: string | number): string {
        return String(this.json[nameOrIndex]);
    }

    isNumber(nameOrIndex: string | number): boolean {
        return nameOrIndex in this.json && typeof this.json[nameOrIndex] == "number";
    }

    getNumber(nameOrIndex: string | number): number {
        return Number(this.json[nameOrIndex]);
    }

    isBoolean(nameOrIndex: string | number): boolean {
        return nameOrIndex in this.json && typeof this.json[nameOrIndex] == "boolean";
    }

    getBoolean(nameOrIndex: string | number): boolean {
        return Boolean(this.json[nameOrIndex]);
    }

    isNull(nameOrIndex: string | number): boolean {
        return nameOrIndex in this.json && typeof this.json[nameOrIndex] == "object" && this.json[nameOrIndex] == null;
    }

    isObject(nameOrIndex: string | number): boolean {
        return (
            nameOrIndex in this.json &&
            typeof this.json[nameOrIndex] == "object" &&
            this.json[nameOrIndex] != null &&
            Array.isArray(this.json[nameOrIndex]) == false
        );
    }

    getObject(nameOrIndex: string | number): Context {
        if (typeof nameOrIndex == "number") {
            return new Context(this.json[nameOrIndex], nameOrIndex, this.getNumber("length"));
        }
        return new Context(this.json[nameOrIndex]);
    }

    isArray(nameOrIndex: string | number): boolean {
        return (
            nameOrIndex in this.json &&
            typeof this.json[nameOrIndex] == "object" &&
            Array.isArray(this.json[nameOrIndex])
        );
    }

    getArray(nameOrIndex: string | number): Context {
        if (typeof nameOrIndex == "number") {
            return new Context(this.json[nameOrIndex], nameOrIndex, this.getNumber("length"));
        }
        return new Context(this.json[nameOrIndex]);
    }
}
