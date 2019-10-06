import {
    FieldNode,
    FieldParentNode,
    FieldParentNodeWithBody,
    isFieldNode,
    isFieldParentNode,
    isFieldParentNodeWithBody
} from "../src/nodes/field_node";

test("isFieldNode", () => {
    const value: FieldNode = { fieldIdentifier: "" };
    expect(isFieldNode(value)).toBe(true);
});

test("isFieldParentNode", () => {
    let value: FieldParentNode = { fieldNodes: [] };
    expect(isFieldParentNode(value)).toBe(true);

    value = { fieldNodes: [], fieldBodies: [] } as FieldParentNodeWithBody;
    expect(isFieldParentNode(value)).toBe(true);
});

test("isFieldParentNodeWithBody", () => {
    let value: FieldParentNode = { fieldNodes: [] };
    expect(isFieldParentNodeWithBody(value)).toBe(false);

    value = { fieldNodes: [], fieldBodies: [] } as FieldParentNodeWithBody;
    expect(isFieldParentNodeWithBody(value)).toBe(true);
});
