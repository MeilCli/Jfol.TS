export class Context {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(public instance: any, private parent: Context | null, public index = 0, public length = 0) {}

    getParent(): Context {
        if (this.parent == null) {
            throw Error("parent is null");
        }
        return this.parent;
    }

    inString(): boolean {
        return typeof this.instance == "string";
    }

    inNumber(): boolean {
        return typeof this.instance == "number";
    }

    inBoolean(): boolean {
        return typeof this.instance == "boolean";
    }

    inNull(): boolean {
        return typeof this.instance == "object" && this.instance == null;
    }

    inObject(): boolean {
        return typeof this.instance == "object" && this.instance != null && Array.isArray(this.instance) == false;
    }

    inArray(): boolean {
        return typeof this.instance == "object" && Array.isArray(this.instance);
    }

    isString(nameOrIndex: string | number): boolean {
        return nameOrIndex in this.instance && typeof this.instance[nameOrIndex] == "string";
    }

    getString(nameOrIndex: string | number): string {
        return String(this.instance[nameOrIndex]);
    }

    isNumber(nameOrIndex: string | number): boolean {
        return nameOrIndex in this.instance && typeof this.instance[nameOrIndex] == "number";
    }

    getNumber(nameOrIndex: string | number): number {
        return Number(this.instance[nameOrIndex]);
    }

    isBoolean(nameOrIndex: string | number): boolean {
        return nameOrIndex in this.instance && typeof this.instance[nameOrIndex] == "boolean";
    }

    getBoolean(nameOrIndex: string | number): boolean {
        return Boolean(this.instance[nameOrIndex]);
    }

    isNull(nameOrIndex: string | number): boolean {
        return (
            nameOrIndex in this.instance &&
            typeof this.instance[nameOrIndex] == "object" &&
            this.instance[nameOrIndex] == null
        );
    }

    isObject(nameOrIndex: string | number): boolean {
        return (
            nameOrIndex in this.instance &&
            typeof this.instance[nameOrIndex] == "object" &&
            this.instance[nameOrIndex] != null &&
            Array.isArray(this.instance[nameOrIndex]) == false
        );
    }

    getObject(nameOrIndex: string | number): Context {
        if (typeof nameOrIndex == "number") {
            return new Context(this.instance[nameOrIndex], this, nameOrIndex, this.getNumber("length"));
        }
        return new Context(this.instance[nameOrIndex], this);
    }

    isArray(nameOrIndex: string | number): boolean {
        return (
            nameOrIndex in this.instance &&
            typeof this.instance[nameOrIndex] == "object" &&
            Array.isArray(this.instance[nameOrIndex])
        );
    }

    getArray(nameOrIndex: string | number): Context {
        if (typeof nameOrIndex == "number") {
            return new Context(this.instance[nameOrIndex], this, nameOrIndex, this.getNumber("length"));
        }
        return new Context(this.instance[nameOrIndex], this);
    }
}
