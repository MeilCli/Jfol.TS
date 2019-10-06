import { TextNode, isTextNode } from "../src/nodes/text_node";

test("isTextNode", () => {
    const value: TextNode = { text: "" };
    expect(isTextNode(value)).toBe(true);
});
