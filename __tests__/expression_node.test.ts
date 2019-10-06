import { ExpressionNode, isExpressionNode } from "../src/nodes/expression_node";

test("isExpressionNode", () => {
    const value: ExpressionNode = { expression: [] };
    expect(isExpressionNode(value)).toBe(true);
});
