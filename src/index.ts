import { Compiler } from "./compilers/compiler";

export function format(jfol: string, json: string): string {
    const compiler = new Compiler();
    return compiler.format(jfol, json);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const form = document.getElementsByName("formatter")[0] as any;
form.getElementsByTagName("input")[0].onclick = function() {
    const json = form.getElementsByTagName("textarea")[0].value;
    const jfol = form.getElementsByTagName("textarea")[1].value;
    const text = format(jfol, json);
    form.getElementsByTagName("textarea")[2].value = text;
};
