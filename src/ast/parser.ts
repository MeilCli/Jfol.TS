import { Token } from "../tokens/token";
import { TokenType } from "../tokens/token_type";
import { Node, ParentNode } from "../nodes/node";
import { TextNode } from "../nodes/text_node";
import { FieldNode, FieldParentNode, FieldParentNodeWithBody, isFieldParentNode } from "../nodes/field_node";
import {
    FunctionNode,
    FunctionParentNode,
    FunctionParentNodeWithArgument,
    FunctionParentNodeWithBody,
    FunctionParentNodeWithArgumentAndBody,
    isFunctionParentNode
} from "../nodes/function_node";
import { OperatorNode, isOperatorNode } from "../nodes/operator_node";
import { LiteralNode, StringNode, BooleanNode, NumberNode, NullNode, isLiteralNode } from "../nodes/literal_node";
import { ExpressionNode, isExpressionNode } from "../nodes/expression_node";

class NumberedToken implements Token {
    public rawText: string;
    public type: TokenType;

    constructor(token: Token, public offset: number) {
        this.rawText = token.rawText;
        this.type = token.type;
    }
}

class Context {
    public consumedCount = 0;

    constructor(public readonly tokens: NumberedToken[], public readonly symbolIndex: number) {}
}

export class Parser {
    parseToken(tokens: Token[]): ParentNode {
        const numberedTokens = this.interimParse(this.toNumberedToken(tokens));
        this.checkBracketOrThrow(numberedTokens);
        return { nodes: this.childParseToken(numberedTokens) };
    }

    private toNumberedToken(tokens: Token[]): NumberedToken[] {
        const result: NumberedToken[] = [];

        let count = 0;
        for (const token of tokens) {
            result.push(new NumberedToken(token, count));
            count += token.rawText.length;
        }

        return result;
    }

    private throwError(token: NumberedToken, message: string) {
        throw Error(`${message}\noffset: ${token.offset}`);
    }

    private interimParse(tokens: NumberedToken[]): NumberedToken[] {
        /**
         * Purpose of interim parse is to extraxt string literal
         */
        const result: NumberedToken[] = [];

        let text = "";
        let literalOffset = 0;
        let whileStringLiteral = false;
        for (const token of tokens) {
            if (token.type == "DoubleQuotation") {
                if (whileStringLiteral == false) {
                    whileStringLiteral = true;
                    literalOffset = token.offset;
                } else {
                    whileStringLiteral = false;
                    result.push(new NumberedToken({ rawText: text, type: "String" }, literalOffset));
                    text = "";
                }
            } else if (whileStringLiteral) {
                text += token.rawText;
            } else {
                result.push(token);
                text = "";
            }
        }

        if (whileStringLiteral) {
            throw Error("not close string literal");
        }

        return result;
    }

    private checkBracketOrThrow(tokens: NumberedToken[]) {
        let parenthesisLevel = 0;
        let squareBracketLevel = 0;
        let squareBracketLevelWhenOpenParenthesis = 0;
        let parenthesisLevelWhenOpenSquareBracket = 0;

        for (const token of tokens) {
            switch (token.type) {
                case "LeftParenthesis":
                    parenthesisLevel += 1;
                    squareBracketLevelWhenOpenParenthesis = squareBracketLevel;
                    break;
                case "RightParenthesis":
                    parenthesisLevel -= 1;
                    if (squareBracketLevel != squareBracketLevelWhenOpenParenthesis) {
                        this.throwError(token, "square brackets does not closed!");
                    }
                    break;
                case "LeftSquareBracket":
                    squareBracketLevel += 1;
                    parenthesisLevelWhenOpenSquareBracket = parenthesisLevel;
                    break;
                case "RightSquareBracket":
                    squareBracketLevel -= 1;
                    if (parenthesisLevel != parenthesisLevelWhenOpenSquareBracket) {
                        this.throwError(token, "parentheses does not closed!");
                    }
                    break;
            }
        }

        if (parenthesisLevel != 0) {
            throw Error("number does not match of left and right parentheses");
        }
        if (squareBracketLevel != 0) {
            throw Error("number does not match of left and right square brackets");
        }
    }

    private childParseToken(tokens: NumberedToken[], parseLiteralAndOperator = false): Node[] {
        const nodes: Node[] = [];

        for (let i = 0; i < tokens.length; i++) {
            const currentToken = tokens[i];
            const context = new Context(tokens, i);

            switch (currentToken.type) {
                case "Dollar":
                    nodes.push(this.parseField(context));
                    break;
                case "DoubleDollar":
                    nodes.push(this.parseFunction(context));
                    break;
                case "LeftParenthesis":
                case "RightParenthesis":
                    if (parseLiteralAndOperator) {
                        nodes.push(this.parseExpression(context));
                        break;
                    }
                    this.throwError(currentToken, `syntax error, please escape ${currentToken.type}`);
                    break;
                case "LeftSquareBracket":
                case "RightSquareBracket":
                    this.throwError(currentToken, `syntax error, please escape ${currentToken.type}`);
                    break;
                default:
                    if (parseLiteralAndOperator) {
                        nodes.push(this.parseLiteralAndOperatorOrText(context));
                    } else {
                        nodes.push({ text: currentToken.rawText } as TextNode);
                    }
                    break;
            }
            i += context.consumedCount;
        }
        return nodes;
    }

    private parseField(context: Context): FieldParentNode {
        if (context.tokens.length <= context.symbolIndex + 1) {
            throw Error("Dollar cannot put last token");
        }
        let nextToken = context.tokens[context.symbolIndex + 1];

        if (nextToken.type != "Text" && nextToken.type != "LeftParenthesis" && nextToken.type != "LeftSquareBracket") {
            throw Error("Dollar must contain element");
        }

        /**
         * identifiers
         */
        const fieldNodes: FieldNode[] = [];
        if (nextToken.type == "Text") {
            fieldNodes.push({
                fieldIdentifier: nextToken.rawText
            } as FieldNode);
            context.consumedCount += 1;
        } else if (nextToken.type == "LeftParenthesis") {
            const foundTokens = this.getBracketTokensUntilFindTarget(
                context.tokens,
                context.symbolIndex + 1,
                "LeftParenthesis",
                "RightParenthesis"
            );
            if (foundTokens.length < 3) {
                throw Error("identifier must have element");
            }
            if (foundTokens.length % 2 != 1) {
                throw Error("identifier syntax error");
            }
            if (foundTokens[1].type != "Text") {
                throw Error("identifier must be text element");
            }

            fieldNodes.push({
                fieldIdentifier: foundTokens[1].rawText
            } as FieldNode);
            for (let i = 2; i < foundTokens.length - 1; i += 2) {
                const dotToken = foundTokens[i];
                const textToken = foundTokens[i + 1];
                if (dotToken.type != "Dot") {
                    this.throwError(dotToken, "nested identifier must chain by dot");
                }
                if (textToken.type != "Text") {
                    this.throwError(textToken, "identifier must be text element");
                }
                fieldNodes.push({
                    fieldIdentifier: textToken.rawText
                } as FieldNode);
            }
            context.consumedCount += foundTokens.length;
        }

        /**
         * Check next token
         */
        if (context.symbolIndex + 1 + context.consumedCount < context.tokens.length) {
            nextToken = context.tokens[context.symbolIndex + 1 + context.consumedCount];
        }
        if (
            nextToken.type != "LeftSquareBracket" ||
            context.symbolIndex + 1 + context.consumedCount == context.tokens.length
        ) {
            return { fieldNodes: fieldNodes } as FieldParentNode;
        }

        /**
         * Bodies
         */
        const foundTokens = this.getBracketTokensUntilFindTarget(
            context.tokens,
            context.symbolIndex + 1 + context.consumedCount,
            "LeftSquareBracket",
            "RightSquareBracket"
        );
        context.consumedCount += foundTokens.length;
        const bodies = this.childParseToken(foundTokens.slice(1, foundTokens.length - 1));
        return {
            fieldNodes: fieldNodes,
            fieldBodies: bodies
        } as FieldParentNodeWithBody;
    }

    private parseFunction(context: Context): FunctionParentNode {
        if (context.tokens.length <= context.symbolIndex + 1) {
            throw Error("DoubleDollar cannot put last token");
        }
        let nextToken = context.tokens[context.symbolIndex + 1];

        if (nextToken.type != "Text" && nextToken.type != "LeftParenthesis" && nextToken.type != "LeftSquareBracket") {
            throw Error("DoubleDollar must contain element");
        }

        /**
         * Identifiers
         */
        const functionNodes: FunctionNode[] = [];
        if (nextToken.type == "Text") {
            functionNodes.push({
                functionIdentifier: nextToken.rawText
            } as FunctionNode);
            context.consumedCount += 1;
        } else if (nextToken.type == "LeftParenthesis") {
            const foundTokens = this.getBracketTokensUntilFindTarget(
                context.tokens,
                context.symbolIndex + 1,
                "LeftParenthesis",
                "RightParenthesis"
            );
            if (foundTokens.length < 3) {
                throw Error("identifier must have element");
            }
            if (foundTokens.length % 2 != 1) {
                throw Error("identifier syntax error");
            }
            if (foundTokens[1].type != "Text") {
                throw Error("identifier must be text element");
            }

            functionNodes.push({
                functionIdentifier: foundTokens[1].rawText
            } as FunctionNode);
            for (let i = 2; i < foundTokens.length - 1; i += 2) {
                const dotToken = foundTokens[i];
                const textToken = foundTokens[i + 1];
                if (dotToken.type != "Dot") {
                    this.throwError(dotToken, "nested identifier must chain by dot");
                }
                if (textToken.type != "Text") {
                    this.throwError(textToken, "identifier must be text element");
                }
                functionNodes.push({
                    functionIdentifier: textToken.rawText
                } as FunctionNode);
            }
            context.consumedCount += foundTokens.length;
        }

        /**
         * Check next token
         */
        if (context.symbolIndex + 1 + context.consumedCount < context.tokens.length) {
            nextToken = context.tokens[context.symbolIndex + 1 + context.consumedCount];
        }
        if (
            (nextToken.type != "LeftParenthesis" && nextToken.type != "LeftSquareBracket") ||
            context.symbolIndex + 1 + context.consumedCount == context.tokens.length
        ) {
            return { functionNodes: functionNodes } as FunctionParentNode;
        }

        /**
         * Arguments
         */
        const argumentNodes: ExpressionNode[] = [];
        if (nextToken.type == "LeftParenthesis") {
            const foundTokens = this.getBracketTokensUntilFindTarget(
                context.tokens,
                context.symbolIndex + 1 + context.consumedCount,
                "LeftParenthesis",
                "RightParenthesis"
            );
            context.consumedCount += foundTokens.length;
            const argumentsTokens = this.divideNodesInSameBracketLevel(
                foundTokens.slice(1, foundTokens.length - 1),
                "Comma"
            );
            for (const argumentTokens of argumentsTokens) {
                if (argumentTokens.length == 0) {
                    throw Error("must put argument element");
                }
                const parsedNodes = this.childParseToken(argumentTokens, true);
                for (const parsedNode of parsedNodes) {
                    if (
                        isFieldParentNode(parsedNode) ||
                        isFunctionParentNode(parsedNode) ||
                        isLiteralNode(parsedNode) ||
                        isOperatorNode(parsedNode) ||
                        isExpressionNode(parsedNode)
                    ) {
                        continue;
                    }
                    throw Error("expression must have field or function or literal or operato or expression");
                }

                this.checkExpressionNode(parsedNodes);

                argumentNodes.push({
                    expression: parsedNodes
                } as ExpressionNode);
            }
        }

        /**
         * Check next token
         */
        if (context.symbolIndex + 1 + context.consumedCount < context.tokens.length) {
            nextToken = context.tokens[context.symbolIndex + 1 + context.consumedCount];
        }
        if (
            nextToken.type != "LeftSquareBracket" ||
            context.symbolIndex + 1 + context.consumedCount == context.tokens.length
        ) {
            if (argumentNodes.length == 0) {
                return { functionNodes: functionNodes } as FunctionParentNode;
            } else {
                return {
                    functionNodes: functionNodes,
                    functionArguments: argumentNodes
                } as FunctionParentNodeWithArgument;
            }
        }

        /**
         * Bodies
         */
        const foundTokens = this.getBracketTokensUntilFindTarget(
            context.tokens,
            context.symbolIndex + 1 + context.consumedCount,
            "LeftSquareBracket",
            "RightSquareBracket"
        );
        context.consumedCount += foundTokens.length;

        const bodyNodes = this.childParseToken(foundTokens.slice(1, foundTokens.length - 1));

        if (argumentNodes.length == 0 && bodyNodes.length == 0) {
            return { functionNodes: functionNodes } as FunctionParentNode;
        } else if (bodyNodes.length == 0) {
            return {
                functionNodes: functionNodes,
                functionArguments: argumentNodes
            } as FunctionParentNodeWithArgument;
        } else if (argumentNodes.length == 0) {
            return {
                functionNodes: functionNodes,
                functionBodies: bodyNodes
            } as FunctionParentNodeWithBody;
        } else {
            return {
                functionNodes: functionNodes,
                functionArguments: argumentNodes,
                functionBodies: bodyNodes
            } as FunctionParentNodeWithArgumentAndBody;
        }
    }

    private getBracketTokensUntilFindTarget(
        tokens: NumberedToken[],
        startIndex: number,
        openTokenType: TokenType,
        closeTokenType: TokenType
    ): NumberedToken[] {
        if (tokens[startIndex].type != openTokenType) {
            throw Error(`internal parser error, not open bracket`);
        }

        const result: NumberedToken[] = [];

        let level = 0;
        for (let i = startIndex; i < tokens.length; i++) {
            const currentToken = tokens[i];
            result.push(currentToken);

            if (currentToken.type == openTokenType) {
                level += 1;
            }
            if (currentToken.type == closeTokenType) {
                level -= 1;
            }

            if (currentToken.type == closeTokenType && level == 0) {
                break;
            }
        }

        if (result[result.length - 1].type != closeTokenType) {
            throw Error(`bracket must close: ${closeTokenType}`);
        }

        return result;
    }

    private divideNodesInSameBracketLevel(tokens: NumberedToken[], divideTokenType: TokenType): NumberedToken[][] {
        const result: NumberedToken[][] = [];
        let array: NumberedToken[] = [];
        let parenthesisLevel = 0;
        let squareBracketLevel = 0;

        for (const token of tokens) {
            switch (token.type) {
                case "LeftParenthesis":
                    parenthesisLevel += 1;
                    break;
                case "RightParenthesis":
                    parenthesisLevel -= 1;
                    break;
                case "LeftSquareBracket":
                    squareBracketLevel += 1;
                    break;
                case "RightSquareBracket":
                    squareBracketLevel -= 1;
                    break;
            }
            if (parenthesisLevel == 0 && squareBracketLevel == 0 && token.type == divideTokenType) {
                result.push(array);
                array = [];
                continue;
            }
            array.push(token);
        }

        if (array.length != 0) {
            result.push(array);
        }

        return result;
    }

    private parseExpression(context: Context): ExpressionNode {
        const foundTokens = this.getBracketTokensUntilFindTarget(
            context.tokens,
            context.symbolIndex,
            "LeftParenthesis",
            "RightParenthesis"
        );

        context.consumedCount += foundTokens.length - 1;
        const nodes = this.childParseToken(foundTokens.slice(1, foundTokens.length - 1), true);
        const expression: Array<
            FieldParentNode | FunctionParentNode | LiteralNode | OperatorNode | ExpressionNode
        > = [];

        for (const node of nodes) {
            if (
                isFieldParentNode(node) ||
                isFunctionParentNode(node) ||
                isLiteralNode(node) ||
                isOperatorNode(node) ||
                isExpressionNode(node)
            ) {
                expression.push(node);
                continue;
            }
            throw Error("expression must have field or function or literal or oprator");
        }

        this.checkExpressionNode(expression);

        return { expression: expression } as ExpressionNode;
    }

    private checkExpressionNode(
        nodes: Array<FieldParentNode | FunctionParentNode | LiteralNode | OperatorNode | ExpressionNode>
    ) {
        if (nodes.length == 0) {
            throw Error("expression must have element");
        }

        const isValueNode = (x: FieldParentNode | FunctionParentNode | LiteralNode | OperatorNode | ExpressionNode) => {
            return isFieldParentNode(x) || isFunctionParentNode(x) || isLiteralNode(x) || isExpressionNode(x);
        };

        if (isValueNode(nodes[0]) == false) {
            throw Error("expression must value in first element");
        }
        if (nodes.length % 2 != 1) {
            throw Error("expression element count must be odd number");
        }

        for (let i = 1; i < nodes.length; i += 2) {
            const operators = nodes[i];
            const value = nodes[i + 1];
            if (isOperatorNode(operators) == false) {
                throw Error("expression must pinch by value and operator");
            }
            if (isValueNode(value) == false) {
                throw Error("expression must pinch by value and operator");
            }
        }
    }

    private parseLiteralAndOperatorOrText(context: Context): OperatorNode | LiteralNode | TextNode {
        const currentToken = context.tokens[context.symbolIndex];
        let nextToken: Token | null;
        if (context.symbolIndex + 1 < context.tokens.length) {
            nextToken = context.tokens[context.symbolIndex + 1];
        } else {
            nextToken = null;
        }
        let nextNextToken: Token | null;
        if (context.symbolIndex + 2 < context.tokens.length) {
            nextNextToken = context.tokens[context.symbolIndex + 2];
        } else {
            nextNextToken = null;
        }

        switch (currentToken.type) {
            case "String":
                return { stringValue: currentToken.rawText } as StringNode;
            case "Text":
                if (currentToken.rawText == "true") {
                    return { booleanValue: true } as BooleanNode;
                }
                if (currentToken.rawText == "false") {
                    return { booleanValue: false } as BooleanNode;
                }
                if (currentToken.rawText == "null") {
                    return { nullValue: null } as NullNode;
                }
                if (isNaN(Number(currentToken.rawText)) == false) {
                    if (
                        nextToken != null &&
                        nextToken.type == "Dot" &&
                        nextNextToken != null &&
                        nextNextToken.type == "Text" &&
                        isNaN(Number(nextNextToken.rawText)) == false
                    ) {
                        context.consumedCount += 2;
                        return {
                            numberValue: Number(`${currentToken.rawText}.${nextNextToken.rawText}`)
                        } as NumberNode;
                    }
                    return { numberValue: Number(currentToken.rawText) } as NumberNode;
                }
                return { text: currentToken.rawText } as TextNode;
            case "Equal":
                if (nextToken != null && nextToken.type == "Equal") {
                    context.consumedCount += 1;
                    return { operator: "==" } as OperatorNode;
                }
                return { text: currentToken.rawText } as TextNode;
            case "Bang":
                if (nextToken != null && nextToken.type == "Equal") {
                    context.consumedCount += 1;
                    return { operator: "!=" } as OperatorNode;
                }
                return { text: currentToken.rawText } as TextNode;
            case "Plus":
                return { operator: "+" } as OperatorNode;
            case "Minus":
                return { operator: "-" } as OperatorNode;
            case "Asterisk":
                return { operator: "*" } as OperatorNode;
            case "Slash":
                return { operator: "/" } as OperatorNode;
            case "Percent":
                return { operator: "%" } as OperatorNode;
            case "Ampersand":
                if (nextToken != null && nextToken.type == "Ampersand") {
                    context.consumedCount += 1;
                    return { operator: "&&" } as OperatorNode;
                }
                return { text: currentToken.rawText } as TextNode;
            case "VerticalLine":
                if (nextToken != null && nextToken.type == "VerticalLine") {
                    context.consumedCount += 1;
                    return { operator: "||" } as OperatorNode;
                }
                return { text: currentToken.rawText } as TextNode;
            case "LessThan":
                if (nextToken != null && nextToken.type == "Equal") {
                    context.consumedCount += 1;
                    return { operator: "<=" } as OperatorNode;
                }
                return { operator: "<" } as OperatorNode;
            case "GreaterThan":
                if (nextToken != null && nextToken.type == "Equal") {
                    context.consumedCount += 1;
                    return { operator: ">=" } as OperatorNode;
                }
                return { operator: ">" } as OperatorNode;
            default:
                return { text: currentToken.rawText } as TextNode;
        }
    }
}
