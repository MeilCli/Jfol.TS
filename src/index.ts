import { Compiler } from "./compilers/compiler";

export function format(jfol: string, json: string): string {
    const compiler = new Compiler();
    return compiler.format(jfol, json);
}
