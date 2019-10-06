import { OperatorNode, isOperatorNode } from "../src/nodes/operator_node";

test("isOperatorNode", () => {
    const value: OperatorNode = { operator: "==" };
    expect(isOperatorNode(value)).toBe(true);
});
