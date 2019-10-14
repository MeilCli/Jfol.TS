import { Compiler } from "../src/compilers/compiler";

test("success", () => {
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
    compiler.format(jfol, json);
});
