import { Compiler } from "../src/compilers/compiler";

test("simple compile", () => {
    const compiler = new Compiler();
    const json = `{
    "array": [
        {
            "package": {
                "name": "pack1"
            }
        },
        {
            "package": {
                "name": "pack2"
            }
        }
    ]
}`;
    const jfol = `Packages Total: $$(array.length)\n$array[$$index: $(package.name)$$separator[\n]]`;

    expect(compiler.format(jfol, json)).toBe(`Packages Total: 2
0: pack1
1: pack2`);
});

test("object - if - compile", () => {
    const compiler = new Compiler();
    const json = `{
    "name": "meil"
}`;
    const jfol = `Hello World$$if($name=="meil")[, MeilCli].`;

    expect(compiler.format(jfol, json)).toBe(`Hello World, MeilCli.`);
});

test("array - foreach - compile1", () => {
    const compiler = new Compiler();
    const json = `{
    "array": [
        {
            "value": 1
        },
        {
            "value": 2
        }
    ]
}`;
    const jfol = `$array[$value]`;

    expect(compiler.format(jfol, json)).toBe(`12`);
});

test("array - foreach - compile2", () => {
    const compiler = new Compiler();
    const json = `{
    "array": [
        1,
        2
    ]
}`;
    const jfol = `$array[$$value]`;

    expect(compiler.format(jfol, json)).toBe(`12`);
});

test("array - separator - compile", () => {
    const compiler = new Compiler();
    const json = `{
    "array": [
        {
            "value": 1
        },
        {
            "value": 2
        }
    ]
}`;
    const jfol = `$array[$value$$separator[\n]]`;

    expect(compiler.format(jfol, json)).toBe(`1
2`);
});

test("array - index - compile", () => {
    const compiler = new Compiler();
    const json = `{
    "array": [
        {
            "value": 1
        },
        {
            "value": 2
        }
    ]
}`;
    const jfol = `$array[index $$index value: $value$$separator[\n]]`;

    expect(compiler.format(jfol, json)).toBe(`index 0 value: 1
index 1 value: 2`);
});

test("array - number - compile", () => {
    const compiler = new Compiler();
    const json = `{
    "array": [
        {
            "value": 1
        },
        {
            "value": 2
        }
    ]
}`;
    const jfol = `$array[number $$number value: $value$$separator[\n]]`;

    expect(compiler.format(jfol, json)).toBe(`number 1 value: 1
number 2 value: 2`);
});

test("array - length - compile", () => {
    const compiler = new Compiler();
    const json = `{
    "array": [
        {
            "value": 1
        },
        {
            "value": 2
        }
    ]
}`;
    const jfol = `Total: $$(array.length)\n$array[number $$number/$$length: $value$$separator[\n]]`;

    expect(compiler.format(jfol, json)).toBe(`Total: 2
number 1/2: 1
number 2/2: 2`);
});

test("array - where - compile", () => {
    const compiler = new Compiler();
    const json = `{
    "array": [
        {
            "value": 1
        },
        {
            "value": 2
        }
    ]
}`;
    const jfol = `$array[value: $value$$where($value==1)]`;

    expect(compiler.format(jfol, json)).toBe(`value: 1`);
});

test("array - root - compile", () => {
    const compiler = new Compiler();
    const json = `[
    {
        "value": 1
    },
    {
        "value": 2
    }
]`;
    const jfol = `$[value: $value$$where($value==1)]`;

    expect(compiler.format(jfol, json)).toBe(`value: 1`);
});
