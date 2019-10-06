import {
    LiteralNode,
    StringNode,
    BooleanNode,
    NumberNode,
    NullNode,
    isLiteralNode,
    isStringNode,
    isBooleanNode,
    isNumberNode,
    isNullNode
} from "../src/nodes/literal_node";

test("isLiteralNode", () => {
    let value: LiteralNode = {};
    expect(isLiteralNode(value)).toBe(false);

    value = { stringValue: "" } as StringNode;
    expect(isLiteralNode(value)).toBe(true);

    value = { booleanValue: true } as BooleanNode;
    expect(isLiteralNode(value)).toBe(true);

    value = { numberValue: 0 } as NumberNode;
    expect(isLiteralNode(value)).toBe(true);

    value = { nullValue: null } as NullNode;
    expect(isLiteralNode(value)).toBe(true);
});

test("isStringNode", () => {
    let value: LiteralNode = {};
    expect(isStringNode(value)).toBe(false);

    value = { stringValue: "" } as StringNode;
    expect(isStringNode(value)).toBe(true);

    value = { booleanValue: true } as BooleanNode;
    expect(isStringNode(value)).toBe(false);

    value = { numberValue: 0 } as NumberNode;
    expect(isStringNode(value)).toBe(false);

    value = { nullValue: null } as NullNode;
    expect(isStringNode(value)).toBe(false);
});

test("isBooleanNode", () => {
    let value: LiteralNode = {};
    expect(isBooleanNode(value)).toBe(false);

    value = { stringValue: "" } as StringNode;
    expect(isBooleanNode(value)).toBe(false);

    value = { booleanValue: true } as BooleanNode;
    expect(isBooleanNode(value)).toBe(true);

    value = { numberValue: 0 } as NumberNode;
    expect(isBooleanNode(value)).toBe(false);

    value = { nullValue: null } as NullNode;
    expect(isBooleanNode(value)).toBe(false);
});

test("isNumberNode", () => {
    let value: LiteralNode = {};
    expect(isNumberNode(value)).toBe(false);

    value = { stringValue: "" } as StringNode;
    expect(isNumberNode(value)).toBe(false);

    value = { booleanValue: true } as BooleanNode;
    expect(isNumberNode(value)).toBe(false);

    value = { numberValue: 0 } as NumberNode;
    expect(isNumberNode(value)).toBe(true);

    value = { nullValue: null } as NullNode;
    expect(isNumberNode(value)).toBe(false);
});

test("isNullNode", () => {
    let value: LiteralNode = {};
    expect(isNullNode(value)).toBe(false);

    value = { stringValue: "" } as StringNode;
    expect(isNullNode(value)).toBe(false);

    value = { booleanValue: true } as BooleanNode;
    expect(isNullNode(value)).toBe(false);

    value = { numberValue: 0 } as NumberNode;
    expect(isNullNode(value)).toBe(false);

    value = { nullValue: null } as NullNode;
    expect(isNullNode(value)).toBe(true);
});
