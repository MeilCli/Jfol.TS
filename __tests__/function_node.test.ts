import {
    FunctionNode,
    FunctionParentNode,
    FunctionParentNodeWithArgument,
    FunctionParentNodeWithBody,
    FunctionParentNodeWithArgumentAndBody,
    isFunctionNode,
    isFunctionParentNode,
    isFunctionParentNodeWithArgument,
    isFunctionParentNodeWithBody,
    isFunctionParentNodeWithArgumentAndBody
} from "../src/nodes/function_node";

test("isFunctionNode", () => {
    const value: FunctionNode = { functionIdentifier: "" };
    expect(isFunctionNode(value)).toBe(true);
});

test("isFunctionParentNode", () => {
    let value: FunctionParentNode = { functionNodes: [] };
    expect(isFunctionParentNode(value)).toBe(true);

    value = { functionNodes: [], functionArguments: [] } as FunctionParentNodeWithArgument;
    expect(isFunctionParentNode(value)).toBe(true);

    value = { functionNodes: [], functionBodies: [] } as FunctionParentNodeWithBody;
    expect(isFunctionParentNode(value)).toBe(true);

    value = {
        functionNodes: [],
        functionArguments: [],
        functionBodies: []
    } as FunctionParentNodeWithArgumentAndBody;
    expect(isFunctionParentNode(value)).toBe(true);
});

test("isFunctionParentNodeWithArgument", () => {
    let value: FunctionParentNode = { functionNodes: [] };
    expect(isFunctionParentNodeWithArgument(value)).toBe(false);

    value = { functionNodes: [], functionArguments: [] } as FunctionParentNodeWithArgument;
    expect(isFunctionParentNodeWithArgument(value)).toBe(true);

    value = { functionNodes: [], functionBodies: [] } as FunctionParentNodeWithBody;
    expect(isFunctionParentNodeWithArgument(value)).toBe(false);

    value = {
        functionNodes: [],
        functionArguments: [],
        functionBodies: []
    } as FunctionParentNodeWithArgumentAndBody;
    expect(isFunctionParentNodeWithArgument(value)).toBe(true);
});

test("isFunctionParentNodeWithBody", () => {
    let value: FunctionParentNode = { functionNodes: [] };
    expect(isFunctionParentNodeWithBody(value)).toBe(false);

    value = { functionNodes: [], functionArguments: [] } as FunctionParentNodeWithArgument;
    expect(isFunctionParentNodeWithBody(value)).toBe(false);

    value = { functionNodes: [], functionBodies: [] } as FunctionParentNodeWithBody;
    expect(isFunctionParentNodeWithBody(value)).toBe(true);

    value = {
        functionNodes: [],
        functionArguments: [],
        functionBodies: []
    } as FunctionParentNodeWithArgumentAndBody;
    expect(isFunctionParentNodeWithBody(value)).toBe(true);
});

test("isFunctionParentNodeWithArgumentAndBody", () => {
    let value: FunctionParentNode = { functionNodes: [] };
    expect(isFunctionParentNodeWithArgumentAndBody(value)).toBe(false);

    value = { functionNodes: [], functionArguments: [] } as FunctionParentNodeWithArgument;
    expect(isFunctionParentNodeWithArgumentAndBody(value)).toBe(false);

    value = { functionNodes: [], functionBodies: [] } as FunctionParentNodeWithBody;
    expect(isFunctionParentNodeWithArgumentAndBody(value)).toBe(false);

    value = {
        functionNodes: [],
        functionArguments: [],
        functionBodies: []
    } as FunctionParentNodeWithArgumentAndBody;
    expect(isFunctionParentNodeWithArgumentAndBody(value)).toBe(true);
});
