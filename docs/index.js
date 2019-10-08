(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const field_node_1 = require("../nodes/field_node");
const function_node_1 = require("../nodes/function_node");
const operator_node_1 = require("../nodes/operator_node");
const literal_node_1 = require("../nodes/literal_node");
const expression_node_1 = require("../nodes/expression_node");
class NumberedToken {
    constructor(token, offset) {
        this.offset = offset;
        this.rawText = token.rawText;
        this.type = token.type;
    }
}
class Context {
    constructor(tokens, symbolIndex) {
        this.tokens = tokens;
        this.symbolIndex = symbolIndex;
        this.consumedCount = 0;
    }
}
class Parser {
    parseToken(tokens) {
        const numberedTokens = this.interimParse(this.toNumberedToken(tokens));
        this.checkBracketOrThrow(numberedTokens);
        return { nodes: this.childParseToken(numberedTokens) };
    }
    toNumberedToken(tokens) {
        const result = [];
        let count = 0;
        for (const token of tokens) {
            result.push(new NumberedToken(token, count));
            count += token.rawText.length;
        }
        return result;
    }
    throwError(token, message) {
        throw Error(`${message}\noffset: ${token.offset}`);
    }
    interimParse(tokens) {
        /**
         * Purpose of interim parse is to extraxt string literal
         */
        const result = [];
        let text = "";
        let literalOffset = 0;
        let whileStringLiteral = false;
        for (const token of tokens) {
            if (token.type == "DoubleQuotation") {
                if (whileStringLiteral == false) {
                    whileStringLiteral = true;
                    literalOffset = token.offset;
                }
                else {
                    whileStringLiteral = false;
                    result.push(new NumberedToken({ rawText: text, type: "String" }, literalOffset));
                }
            }
            else if (whileStringLiteral) {
                text += token.rawText;
            }
            else {
                result.push(token);
            }
        }
        if (whileStringLiteral) {
            throw Error("not close string literal");
        }
        return result;
    }
    checkBracketOrThrow(tokens) {
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
    childParseToken(tokens, parseLiteralAndOperator = false) {
        const nodes = [];
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
                    }
                    else {
                        nodes.push({ text: currentToken.rawText });
                    }
                    break;
            }
            i += context.consumedCount;
        }
        return nodes;
    }
    parseField(context) {
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
        const fieldNodes = [];
        if (nextToken.type == "Text") {
            fieldNodes.push({
                fieldIdentifier: nextToken.rawText
            });
            context.consumedCount += 1;
        }
        else if (nextToken.type == "LeftParenthesis") {
            const foundTokens = this.getBracketTokensUntilFindTarget(context.tokens, context.symbolIndex + 1, "LeftParenthesis", "RightParenthesis");
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
            });
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
                });
            }
            context.consumedCount += foundTokens.length;
        }
        /**
         * Check next token
         */
        if (context.symbolIndex + 1 + context.consumedCount < context.tokens.length) {
            nextToken = context.tokens[context.symbolIndex + 1 + context.consumedCount];
        }
        if (nextToken.type != "LeftSquareBracket") {
            return { fieldNodes: fieldNodes };
        }
        /**
         * Bodies
         */
        const foundTokens = this.getBracketTokensUntilFindTarget(context.tokens, context.symbolIndex + 1 + context.consumedCount, "LeftSquareBracket", "RightSquareBracket");
        context.consumedCount += foundTokens.length;
        const bodies = this.childParseToken(foundTokens.slice(1, foundTokens.length - 1));
        return {
            fieldNodes: fieldNodes,
            fieldBodies: bodies
        };
    }
    parseFunction(context) {
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
        const functionNodes = [];
        if (nextToken.type == "Text") {
            functionNodes.push({
                functionIdentifier: nextToken.rawText
            });
            context.consumedCount += 1;
        }
        else if (nextToken.type == "LeftParenthesis") {
            const foundTokens = this.getBracketTokensUntilFindTarget(context.tokens, context.symbolIndex + 1, "LeftParenthesis", "RightParenthesis");
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
            });
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
                });
            }
            context.consumedCount += foundTokens.length;
        }
        /**
         * Check next token
         */
        if (context.symbolIndex + 1 + context.consumedCount < context.tokens.length) {
            nextToken = context.tokens[context.symbolIndex + 1 + context.consumedCount];
        }
        if (nextToken.type != "LeftParenthesis" && nextToken.type != "LeftSquareBracket") {
            return { functionNodes: functionNodes };
        }
        /**
         * Arguments
         */
        const argumentNodes = [];
        if (nextToken.type == "LeftParenthesis") {
            const foundTokens = this.getBracketTokensUntilFindTarget(context.tokens, context.symbolIndex + 1 + context.consumedCount, "LeftParenthesis", "RightParenthesis");
            context.consumedCount += foundTokens.length;
            const argumentsTokens = this.divideNodesInSameBracketLevel(foundTokens.slice(1, foundTokens.length - 1), "Comma");
            for (const argumentTokens of argumentsTokens) {
                if (argumentTokens.length == 0) {
                    throw Error("must put argument element");
                }
                const parsedNodes = this.childParseToken(argumentTokens, true);
                for (const parsedNode of parsedNodes) {
                    if (field_node_1.isFieldParentNode(parsedNode) ||
                        function_node_1.isFunctionParentNode(parsedNode) ||
                        literal_node_1.isLiteralNode(parsedNode) ||
                        operator_node_1.isOperatorNode(parsedNode) ||
                        expression_node_1.isExpressionNode(parsedNode)) {
                        continue;
                    }
                    throw Error("expression must have field or function or literal or operato or expression");
                }
                this.checkExpressionNode(parsedNodes);
                argumentNodes.push({
                    expression: parsedNodes
                });
            }
        }
        /**
         * Check next token
         */
        if (context.symbolIndex + 1 + context.consumedCount < context.tokens.length) {
            nextToken = context.tokens[context.symbolIndex + 1 + context.consumedCount];
        }
        if (nextToken.type != "LeftSquareBracket") {
            if (argumentNodes.length == 0) {
                return { functionNodes: functionNodes };
            }
            else {
                return {
                    functionNodes: functionNodes,
                    functionArguments: argumentNodes
                };
            }
        }
        /**
         * Bodies
         */
        const foundTokens = this.getBracketTokensUntilFindTarget(context.tokens, context.symbolIndex + 1 + context.consumedCount, "LeftSquareBracket", "RightSquareBracket");
        context.consumedCount += foundTokens.length;
        const bodyNodes = this.childParseToken(foundTokens.slice(1, foundTokens.length - 1));
        if (argumentNodes.length == 0 && bodyNodes.length == 0) {
            return { functionNodes: functionNodes };
        }
        else if (bodyNodes.length == 0) {
            return {
                functionNodes: functionNodes,
                functionArguments: argumentNodes
            };
        }
        else if (argumentNodes.length == 0) {
            return {
                functionNodes: functionNodes,
                functionBodies: bodyNodes
            };
        }
        else {
            return {
                functionNodes: functionNodes,
                functionArguments: argumentNodes,
                functionBodies: bodyNodes
            };
        }
    }
    getBracketTokensUntilFindTarget(tokens, startIndex, openTokenType, closeTokenType) {
        if (tokens[startIndex].type != openTokenType) {
            throw Error(`internal parser error, not open bracket`);
        }
        const result = [];
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
    divideNodesInSameBracketLevel(tokens, divideTokenType) {
        const result = [];
        let array = [];
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
    parseExpression(context) {
        const foundTokens = this.getBracketTokensUntilFindTarget(context.tokens, context.symbolIndex, "LeftParenthesis", "RightParenthesis");
        context.consumedCount += foundTokens.length;
        const nodes = this.childParseToken(foundTokens.slice(1, foundTokens.length - 1), true);
        const expression = [];
        for (const node of nodes) {
            if (field_node_1.isFieldParentNode(node) ||
                function_node_1.isFunctionParentNode(node) ||
                literal_node_1.isLiteralNode(node) ||
                operator_node_1.isOperatorNode(node) ||
                expression_node_1.isExpressionNode(node)) {
                expression.push(node);
                continue;
            }
            throw Error("expression must have field or function or literal or oprator");
        }
        this.checkExpressionNode(expression);
        return { expression: expression };
    }
    checkExpressionNode(nodes) {
        if (nodes.length == 0) {
            throw Error("expression must have element");
        }
        const isValueNode = (x) => {
            return field_node_1.isFieldParentNode(x) || function_node_1.isFunctionParentNode(x) || literal_node_1.isLiteralNode(x) || expression_node_1.isExpressionNode(x);
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
            if (operator_node_1.isOperatorNode(operators) == false) {
                throw Error("expression must pinch by value and operator");
            }
            if (isValueNode(value) == false) {
                throw Error("expression must pinch by value and operator");
            }
        }
    }
    parseLiteralAndOperatorOrText(context) {
        const currentToken = context.tokens[context.symbolIndex];
        let nextToken;
        if (context.symbolIndex + 1 < context.tokens.length) {
            nextToken = context.tokens[context.symbolIndex + 1];
        }
        else {
            nextToken = null;
        }
        let nextNextToken;
        if (context.symbolIndex + 2 < context.tokens.length) {
            nextNextToken = context.tokens[context.symbolIndex + 2];
        }
        else {
            nextNextToken = null;
        }
        switch (currentToken.type) {
            case "String":
                return { stringValue: currentToken.rawText };
            case "Text":
                if (currentToken.rawText == "true") {
                    return { booleanValue: true };
                }
                if (currentToken.rawText == "false") {
                    return { booleanValue: false };
                }
                if (currentToken.rawText == "null") {
                    return { nullValue: null };
                }
                if (isNaN(Number(currentToken.rawText)) == false) {
                    if (nextToken != null &&
                        nextToken.type == "Dot" &&
                        nextNextToken != null &&
                        nextNextToken.type == "Text" &&
                        isNaN(Number(nextNextToken.rawText)) == false) {
                        context.consumedCount += 2;
                        return {
                            numberValue: Number(`${currentToken.rawText}.${nextNextToken.rawText}`)
                        };
                    }
                    return { numberValue: Number(currentToken.rawText) };
                }
                return { text: currentToken.rawText };
            case "Equal":
                if (nextToken != null && nextToken.type == "Equal") {
                    context.consumedCount += 1;
                    return { operator: "==" };
                }
                return { text: currentToken.rawText };
            case "Bang":
                if (nextToken != null && nextToken.type == "Equal") {
                    context.consumedCount += 1;
                    return { operator: "!=" };
                }
                return { text: currentToken.rawText };
            case "Plus":
                return { operator: "+" };
            case "Minus":
                return { operator: "-" };
            case "Asterisk":
                return { operator: "*" };
            case "Slash":
                return { operator: "/" };
            case "Percent":
                return { operator: "%" };
            case "Ampersand":
                if (nextToken != null && nextToken.type == "Ampersand") {
                    context.consumedCount += 1;
                    return { operator: "&&" };
                }
                return { text: currentToken.rawText };
            case "VerticalLine":
                if (nextToken != null && nextToken.type == "VerticalLine") {
                    context.consumedCount += 1;
                    return { operator: "||" };
                }
                return { text: currentToken.rawText };
            case "LessThan":
                if (nextToken != null && nextToken.type == "Equal") {
                    context.consumedCount += 1;
                    return { operator: "<=" };
                }
                return { operator: "<" };
            case "GreaterThan":
                if (nextToken != null && nextToken.type == "Equal") {
                    context.consumedCount += 1;
                    return { operator: ">=" };
                }
                return { operator: ">" };
            default:
                return { text: currentToken.rawText };
        }
    }
}
exports.Parser = Parser;

},{"../nodes/expression_node":36,"../nodes/field_node":37,"../nodes/function_node":38,"../nodes/literal_node":39,"../nodes/operator_node":40}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_plugin_1 = require("./compiler_plugin");
const context_1 = require("./context");
const if_function_1 = require("./functions/if_function");
const index_function_1 = require("./functions/index_function");
const length_function_1 = require("./functions/length_function");
const number_function_1 = require("./functions/number_function");
const separator_function_1 = require("./functions/separator_function");
const value_function_1 = require("./functions/value_function");
const where_function_1 = require("./functions/where_function");
const lexer_1 = require("../lexers/lexer");
const parser_1 = require("../ast/parser");
const analyzer_1 = require("../semantic/analyzer");
const eval_function_1 = require("./functions/eval_function");
class FormatCompilerPlugin extends compiler_plugin_1.CompilerPlugin {
    constructor() {
        super(...arguments);
        this.functions = [
            ["eval", (x, y) => new eval_function_1.EvalFunction(this, x, y)],
            ["if", (x, y) => new if_function_1.IfFunction(this, x, y)],
            ["index", (x, y) => new index_function_1.IndexFunction(this, x, y)],
            ["length", (x, y) => new length_function_1.LengthFunction(this, x, y)],
            ["number", (x, y) => new number_function_1.NumberFunction(this, x, y)],
            ["separator", (x, y) => new separator_function_1.SeparatorFunction(this, x, y)],
            ["value", (x, y) => new value_function_1.ValueFunction(this, x, y)],
            ["where", (x, y) => new where_function_1.WhereFunction(this, x, y)]
        ];
    }
}
class Compiler {
    format(jfol, json) {
        const lexer = new lexer_1.Lexer();
        const parser = new parser_1.Parser();
        const analyzer = new analyzer_1.Analyzer();
        const compilerPlugin = new FormatCompilerPlugin();
        const parentNode = analyzer.analyze(parser.parseToken(lexer.analyzeToken(jfol)));
        const value = JSON.parse(json);
        const context = new context_1.Context(value);
        let text = "";
        for (const node of parentNode.nodes) {
            // eslint-disable-next-line @typescript-eslint/ban-types
            const object = compilerPlugin.getObject(context, node);
            text += object.executeString();
        }
        return text;
    }
}
exports.Compiler = Compiler;

},{"../ast/parser":1,"../lexers/lexer":35,"../semantic/analyzer":42,"./compiler_plugin":3,"./context":4,"./functions/eval_function":7,"./functions/if_function":8,"./functions/index_function":9,"./functions/length_function":10,"./functions/number_function":11,"./functions/separator_function":12,"./functions/value_function":13,"./functions/where_function":14}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_node_1 = require("../nodes/function_node");
const field_node_1 = require("../nodes/field_node");
const literal_node_1 = require("../nodes/literal_node");
const expression_node_1 = require("../nodes/expression_node");
const text_node_1 = require("../nodes/text_node");
const string_object_1 = require("./literals/string_object");
const boolean_object_1 = require("./literals/boolean_object");
const number_object_1 = require("./literals/number_object");
const null_object_1 = require("./literals/null_object");
const equal_operator_1 = require("./operators/equal_operator");
const not_equal_operator_1 = require("./operators/not_equal_operator");
const plus_operator_1 = require("./operators/plus_operator");
const minus_operator_1 = require("./operators/minus_operator");
const percent_operator_1 = require("./operators/percent_operator");
const asterisk_operator_1 = require("./operators/asterisk_operator");
const slash_operator_1 = require("./operators/slash_operator");
const double_ampersand_operator_1 = require("./operators/double_ampersand_operator");
const double_vertical_line_operator_1 = require("./operators/double_vertical_line_operator");
const less_than_operator_1 = require("./operators/less_than_operator");
const less_than_or_equal_operator_1 = require("./operators/less_than_or_equal_operator");
const greater_than_operator_1 = require("./operators/greater_than_operator");
const greater_than_or_equal_operator_1 = require("./operators/greater_than_or_equal_operator");
const text_1 = require("./text");
const field_1 = require("./field");
class CompilerPlugin {
    getObject(context, node) {
        if (text_node_1.isTextNode(node)) {
            return this.getTextObject(node);
        }
        if (function_node_1.isFunctionParentNode(node)) {
            return this.getFunctionObject(context, node);
        }
        if (field_node_1.isFieldParentNode(node)) {
            return this.getFieldObject(context, node);
        }
        if (literal_node_1.isLiteralNode(node)) {
            return this.getLiteralObject(node);
        }
        if (expression_node_1.isExpressionNode(node)) {
            return this.getOperatorObject(context, node);
        }
        throw Error("internal compiler error, cannot handle node");
    }
    getFunctionObject(context, functionParentNode) {
        if (functionParentNode.functionNodes.length < 1) {
            throw Error("internal compiler error, must have function identifier");
        }
        const executeContext = this.nestedContext(context, functionParentNode.functionNodes.map(x => x.functionIdentifier));
        const functionIdentifier = functionParentNode.functionNodes[functionParentNode.functionNodes.length - 1].functionIdentifier;
        for (const functionObject of this.functions) {
            if (functionObject[0] == functionIdentifier) {
                return functionObject[1](executeContext, functionParentNode);
            }
        }
        throw Error("Not found function");
    }
    getFieldObject(context, fieldParentNode) {
        const executeContext = this.nestedContext(context, fieldParentNode.fieldNodes.map(x => x.fieldIdentifier));
        return new field_1.Field(this, executeContext, fieldParentNode);
    }
    nestedContext(context, identifiers) {
        if (identifiers.length < 1) {
            return context;
        }
        let nestedContext = context;
        for (let i = 0; i < identifiers.length - 1; i++) {
            nestedContext = context.getObject(identifiers[i]);
        }
        return nestedContext;
    }
    getTextObject(textNode) {
        return new text_1.TextObject(textNode);
    }
    getLiteralObject(literalNode) {
        if (literal_node_1.isStringNode(literalNode)) {
            return new string_object_1.StringObject(literalNode);
        }
        else if (literal_node_1.isBooleanNode(literalNode)) {
            return new boolean_object_1.BooleanObject(literalNode);
        }
        else if (literal_node_1.isNumberNode(literalNode)) {
            return new number_object_1.NumberObject(literalNode);
        }
        else if (literal_node_1.isNullNode(literalNode)) {
            return new null_object_1.NullObject(literalNode);
        }
        throw new Error("Method not implemented.");
    }
    getOperatorObject(context, expressionNode) {
        switch (expressionNode.expression[0].operator) {
            case "==":
                return new equal_operator_1.EqualOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "!=":
                return new not_equal_operator_1.NotEqualOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "+":
                return new plus_operator_1.PlusOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "-":
                return new minus_operator_1.MinusOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "%":
                return new percent_operator_1.PercentOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "*":
                return new asterisk_operator_1.AsteriskOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "/":
                return new slash_operator_1.SlashOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "&&":
                return new double_ampersand_operator_1.DoubleAmpersandOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "||":
                return new double_vertical_line_operator_1.DoubleVerticalLineOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "<":
                return new less_than_operator_1.LessThanOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case "<=":
                return new less_than_or_equal_operator_1.LessThanOrEqualOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case ">":
                return new greater_than_operator_1.GreaterThanOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
            case ">=":
                return new greater_than_or_equal_operator_1.GreaterThanOrEqualOperator(this, context, expressionNode.expression[1], expressionNode.expression[2]);
        }
        throw Error("internal compiler error, not found operator");
    }
}
exports.CompilerPlugin = CompilerPlugin;

},{"../nodes/expression_node":36,"../nodes/field_node":37,"../nodes/function_node":38,"../nodes/literal_node":39,"../nodes/text_node":41,"./field":5,"./literals/boolean_object":15,"./literals/null_object":16,"./literals/number_object":17,"./literals/string_object":18,"./operators/asterisk_operator":20,"./operators/double_ampersand_operator":21,"./operators/double_vertical_line_operator":22,"./operators/equal_operator":23,"./operators/greater_than_operator":24,"./operators/greater_than_or_equal_operator":25,"./operators/less_than_operator":26,"./operators/less_than_or_equal_operator":27,"./operators/minus_operator":28,"./operators/not_equal_operator":29,"./operators/percent_operator":30,"./operators/plus_operator":31,"./operators/slash_operator":32,"./text":33}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Context {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(json, index = 0, length = 0) {
        this.json = json;
        this.index = index;
        this.length = length;
    }
    inString() {
        return typeof this.json == "string";
    }
    inNumber() {
        return typeof this.json == "number";
    }
    inBoolean() {
        return typeof this.json == "boolean";
    }
    inNull() {
        return typeof this.json == "object" && this.json == null;
    }
    inObject() {
        return typeof this.json == "object" && this.json != null && Array.isArray(this.json) == false;
    }
    inArray() {
        return typeof this.json == "object" && Array.isArray(this.json);
    }
    isString(nameOrIndex) {
        return nameOrIndex in this.json && typeof this.json[nameOrIndex] == "string";
    }
    getString(nameOrIndex) {
        return String(this.json[nameOrIndex]);
    }
    isNumber(nameOrIndex) {
        return nameOrIndex in this.json && typeof this.json[nameOrIndex] == "number";
    }
    getNumber(nameOrIndex) {
        return Number(this.json[nameOrIndex]);
    }
    isBoolean(nameOrIndex) {
        return nameOrIndex in this.json && typeof this.json[nameOrIndex] == "boolean";
    }
    getBoolean(nameOrIndex) {
        return Boolean(this.json[nameOrIndex]);
    }
    isNull(nameOrIndex) {
        return nameOrIndex in this.json && typeof this.json[nameOrIndex] == "object" && this.json[nameOrIndex] == null;
    }
    isObject(nameOrIndex) {
        return (nameOrIndex in this.json &&
            typeof this.json[nameOrIndex] == "object" &&
            this.json[nameOrIndex] != null &&
            Array.isArray(this.json[nameOrIndex]) == false);
    }
    getObject(nameOrIndex) {
        if (typeof nameOrIndex == "number") {
            return new Context(this.json[nameOrIndex], nameOrIndex, this.getNumber("length"));
        }
        return new Context(this.json[nameOrIndex]);
    }
    isArray(nameOrIndex) {
        return (nameOrIndex in this.json &&
            typeof this.json[nameOrIndex] == "object" &&
            Array.isArray(this.json[nameOrIndex]));
    }
    getArray(nameOrIndex) {
        if (typeof nameOrIndex == "number") {
            return new Context(this.json[nameOrIndex], nameOrIndex, this.getNumber("length"));
        }
        return new Context(this.json[nameOrIndex]);
    }
}
exports.Context = Context;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_node_1 = require("../nodes/function_node");
const field_node_1 = require("../nodes/field_node");
const text_node_1 = require("../nodes/text_node");
const separator_function_1 = require("./functions/separator_function");
const where_function_1 = require("./functions/where_function");
class Field {
    constructor(compilerPlugin, context, fieldParentNode) {
        this.compilerPlugin = compilerPlugin;
        this.context = context;
        // for array
        this.index = 0;
        this.fieldParentNodeWithBody = null;
        this.separatorFunction = null;
        this.whereFunction = null;
        if (fieldParentNode.fieldNodes.length == 0) {
            this.identifier = "";
        }
        else {
            this.identifier = fieldParentNode.fieldNodes[fieldParentNode.fieldNodes.length - 1].fieldIdentifier;
        }
        if (field_node_1.isFieldParentNodeWithBody(fieldParentNode)) {
            if (context.isObject(this.identifier)) {
                const nestedContext = context.getObject(this.identifier);
                this.fieldBodies = this.getFieldBodiesInObject(compilerPlugin, nestedContext, fieldParentNode);
            }
            else {
                this.fieldBodies = null;
                this.fieldParentNodeWithBody = fieldParentNode;
            }
        }
        else {
            this.fieldBodies = null;
        }
    }
    getFieldBodiesInObject(compilerPlugin, context, fieldParentNodeWithBody) {
        return fieldParentNodeWithBody.fieldBodies
            .map(x => {
            if (field_node_1.isFieldParentNode(x)) {
                return compilerPlugin.getFieldObject(context, x);
            }
            if (function_node_1.isFunctionParentNode(x)) {
                return compilerPlugin.getFunctionObject(context, x);
            }
            if (text_node_1.isTextNode(x)) {
                return compilerPlugin.getTextObject(x);
            }
            throw Error("internal compiler error, not found node");
        })
            .filter(x => {
            if (x instanceof separator_function_1.SeparatorFunction || x instanceof where_function_1.WhereFunction) {
                return false;
            }
            return true;
        });
    }
    hasNextInArray() {
        if (this.identifier.length == 0) {
            return this.index < this.context.getNumber("length");
        }
        return this.index < this.context.getArray(this.identifier).getNumber("length");
    }
    applyCurrentFieldBodiesInArray() {
        if (this.fieldParentNodeWithBody == null) {
            throw Error("internal compiler error, array field");
        }
        let nestedContext;
        if (this.identifier.length == 0) {
            nestedContext = this.context.getObject(this.index);
        }
        else {
            nestedContext = this.context.getObject(this.identifier).getObject(this.index);
        }
        this.fieldBodies = this.fieldParentNodeWithBody.fieldBodies
            .map(x => {
            if (field_node_1.isFieldParentNode(x)) {
                return this.compilerPlugin.getFieldObject(nestedContext, x);
            }
            if (function_node_1.isFunctionParentNode(x)) {
                return this.compilerPlugin.getFunctionObject(nestedContext, x);
            }
            if (text_node_1.isTextNode(x)) {
                return this.compilerPlugin.getTextObject(x);
            }
            throw Error("internal compiler error, not found node");
        })
            .filter(x => {
            if (x instanceof separator_function_1.SeparatorFunction) {
                this.separatorFunction = x;
                return false;
            }
            if (x instanceof where_function_1.WhereFunction) {
                this.whereFunction = x;
                return false;
            }
            return true;
        });
    }
    objectTypes() {
        if (this.context.isArray(this.identifier) ||
            this.context.isObject(this.identifier) ||
            this.context.isString(this.identifier)) {
            return ["String"];
        }
        if (this.context.isNumber(this.identifier)) {
            return ["Number", "String"];
        }
        if (this.context.isBoolean(this.identifier)) {
            return ["Boolean", "String"];
        }
        if (this.context.isNull(this.identifier)) {
            return ["Null", "String"];
        }
        throw new Error("Method not implemented.");
    }
    executeString() {
        if (this.fieldBodies == null && this.identifier.length != 0 && this.context.isArray(this.identifier) == false) {
            return this.context.getString(this.identifier);
        }
        if (this.fieldBodies != null && this.context.isObject(this.identifier)) {
            let text = "";
            for (const body of this.fieldBodies) {
                text += body.executeString();
            }
            return text;
        }
        let text = "";
        while (this.hasNextInArray()) {
            this.applyCurrentFieldBodiesInArray();
            if (this.whereFunction != null && this.whereFunction.executeBoolean() == false) {
                this.index += 1;
                continue;
            }
            if (this.separatorFunction != null && 0 < text.length) {
                text += this.separatorFunction.executeString();
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const body of this.fieldBodies) {
                text += body.executeString();
            }
            this.index += 1;
        }
        return text;
    }
    executeBoolean() {
        return this.context.getBoolean(this.identifier);
    }
    executeNumber() {
        return this.context.getNumber(this.identifier);
    }
    executeNull() {
        return null;
    }
}
exports.Field = Field;

},{"../nodes/field_node":37,"../nodes/function_node":38,"../nodes/text_node":41,"./functions/separator_function":12,"./functions/where_function":14}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_node_1 = require("../nodes/function_node");
const field_node_1 = require("../nodes/field_node");
const text_node_1 = require("../nodes/text_node");
class Function {
    constructor(compilerPlugin, context, functionParentNode) {
        this.compilerPlugin = compilerPlugin;
        this.functionIdentifires = functionParentNode.functionNodes.map(x => x.functionIdentifier);
        if (function_node_1.isFunctionParentNodeWithArgument(functionParentNode)) {
            this.functionArguments = functionParentNode.functionArguments.map(x => {
                if (x.expression.length == 1) {
                    return compilerPlugin.getLiteralObject(x.expression[0]);
                }
                else {
                    return compilerPlugin.getOperatorObject(context, x);
                }
            });
        }
        else {
            this.functionArguments = null;
        }
        if (function_node_1.isFunctionParentNodeWithBody(functionParentNode)) {
            this.functionBodies = functionParentNode.functionBodies.map(x => {
                if (field_node_1.isFieldParentNode(x)) {
                    return compilerPlugin.getFieldObject(context, x);
                }
                if (function_node_1.isFunctionParentNode(x)) {
                    return compilerPlugin.getFunctionObject(context, x);
                }
                if (text_node_1.isTextNode(x)) {
                    return compilerPlugin.getTextObject(x);
                }
                throw Error("internal compiler error, not found node");
            });
        }
        else {
            this.functionBodies = null;
        }
    }
}
exports.Function = Function;

},{"../nodes/field_node":37,"../nodes/function_node":38,"../nodes/text_node":41}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../function");
class EvalFunction extends function_1.Function {
    constructor(compilerPlugin, context, functionParentNode) {
        super(compilerPlugin, context, functionParentNode);
        if (this.functionArguments == null || this.functionArguments.length != 1) {
            throw Error("eval function must have single argument");
        }
        this.evalFunction = this.functionArguments[0];
        if (this.functionBodies != null) {
            throw Error("eval function cannot have body");
        }
    }
    objectTypes() {
        return ["String"];
    }
    executeString() {
        if (this.evalFunction.objectTypes().includes("Number")) {
            return String(this.evalFunction.executeNumber());
        }
        if (this.evalFunction.objectTypes().includes("Boolean")) {
            return String(this.evalFunction.executeBoolean());
        }
        if (this.evalFunction.objectTypes().includes("Null")) {
            return String(this.evalFunction.executeNull());
        }
        return this.evalFunction.executeString();
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.EvalFunction = EvalFunction;

},{"../function":6}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../function");
class IfFunction extends function_1.Function {
    constructor(compilerPlugin, context, functionParentNode) {
        super(compilerPlugin, context, functionParentNode);
        if (this.functionArguments == null || this.functionArguments.length != 1) {
            throw Error("if function must have single argument");
        }
        this.condition = this.functionArguments[0];
        if (this.condition.objectTypes().includes("Boolean") == false) {
            throw Error("if function argument must be boolean");
        }
        if (this.functionBodies == null) {
            throw Error("if function must have bodies");
        }
    }
    objectTypes() {
        return ["String"];
    }
    executeString() {
        let text = "";
        if (this.condition.executeBoolean()) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const body of this.functionBodies) {
                text += body.executeString();
            }
        }
        return text;
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.IfFunction = IfFunction;

},{"../function":6}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../function");
class IndexFunction extends function_1.Function {
    constructor(compilerPlugin, context, functionParentNode) {
        super(compilerPlugin, context, functionParentNode);
        this.context = context;
        if (this.functionArguments != null) {
            throw Error("index function cannot have argument");
        }
        if (this.functionBodies != null) {
            throw Error("index function cannot have body");
        }
    }
    objectTypes() {
        return ["Number", "String"];
    }
    executeString() {
        return String(this.context.index);
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        return this.context.index;
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.IndexFunction = IndexFunction;

},{"../function":6}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../function");
class LengthFunction extends function_1.Function {
    constructor(compilerPlugin, context, functionParentNode) {
        super(compilerPlugin, context, functionParentNode);
        this.context = context;
        if (this.functionArguments != null) {
            throw Error("length function cannot have argument");
        }
        if (this.functionBodies != null) {
            throw Error("length function cannot have body");
        }
    }
    objectTypes() {
        return ["Number", "String"];
    }
    executeString() {
        if (this.context.inArray() == false) {
            return String(this.context.length);
        }
        return String(this.context.getNumber("length"));
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        if (this.context.inArray() == false) {
            return this.context.length;
        }
        return this.context.getNumber("length");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.LengthFunction = LengthFunction;

},{"../function":6}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../function");
class NumberFunction extends function_1.Function {
    constructor(compilerPlugin, context, functionParentNode) {
        super(compilerPlugin, context, functionParentNode);
        this.context = context;
        if (this.functionArguments != null) {
            throw Error("number function cannot have argument");
        }
        if (this.functionBodies != null) {
            throw Error("number function cannot have body");
        }
    }
    objectTypes() {
        return ["Number", "String"];
    }
    executeString() {
        return String(this.context.index + 1);
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        return this.context.index + 1;
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.NumberFunction = NumberFunction;

},{"../function":6}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../function");
class SeparatorFunction extends function_1.Function {
    constructor(compilerPlugin, context, functionParentNode) {
        super(compilerPlugin, context, functionParentNode);
        if (this.functionArguments != null) {
            throw Error("separator function cannot have argument");
        }
        if (this.functionBodies == null) {
            throw Error("separator function must have bodies");
        }
    }
    objectTypes() {
        return ["String"];
    }
    executeString() {
        let text = "";
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const body of this.functionBodies) {
            text += body.executeString();
        }
        return text;
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.SeparatorFunction = SeparatorFunction;

},{"../function":6}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../function");
class ValueFunction extends function_1.Function {
    constructor(compilerPlugin, context, functionParentNode) {
        super(compilerPlugin, context, functionParentNode);
        this.context = context;
        if (this.functionArguments != null) {
            throw Error("value function cannot have argument");
        }
        if (this.functionBodies != null) {
            throw Error("value function cannot have body");
        }
    }
    objectTypes() {
        if (this.context.inString()) {
            return ["String"];
        }
        if (this.context.inNumber()) {
            return ["Number", "String"];
        }
        if (this.context.inBoolean()) {
            return ["Boolean", "String"];
        }
        if (this.context.inNumber()) {
            return ["Null", "String"];
        }
        throw Error("internal compiler error, not handle type");
    }
    executeString() {
        if (this.context.inString()) {
            return String(this.context.json);
        }
        if (this.context.inBoolean()) {
            return String(this.context.json);
        }
        if (this.context.inNumber()) {
            return String(this.context.json);
        }
        if (this.context.inNull()) {
            return "null";
        }
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        if (this.context.inBoolean()) {
            return Boolean(this.context.json);
        }
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        if (this.context.inNumber()) {
            return Number(this.context.json);
        }
        throw new Error("Method not implemented.");
    }
    executeNull() {
        if (this.context.inNull()) {
            return null;
        }
        throw new Error("Method not implemented.");
    }
}
exports.ValueFunction = ValueFunction;

},{"../function":6}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../function");
class WhereFunction extends function_1.Function {
    constructor(compilerPlugin, context, functionParentNode) {
        super(compilerPlugin, context, functionParentNode);
        if (this.functionArguments == null || this.functionArguments.length != 1) {
            throw Error("where function must have single argument");
        }
        this.condition = this.functionArguments[0];
        if (this.condition.objectTypes().includes("Boolean") == false) {
            throw Error("where function argument must be boolean");
        }
        if (this.functionBodies != null) {
            throw Error("where function cannot have body");
        }
    }
    objectTypes() {
        return ["Boolean"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        return this.condition.executeBoolean();
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.WhereFunction = WhereFunction;

},{"../function":6}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BooleanObject {
    constructor(booleanNode) {
        this.booleanNode = booleanNode;
    }
    objectTypes() {
        return ["Boolean"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        return this.booleanNode.booleanValue;
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.BooleanObject = BooleanObject;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NullObject {
    constructor(nullNode) {
        this.nullNode = nullNode;
    }
    objectTypes() {
        return ["Null"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        return this.nullNode.nullValue;
    }
}
exports.NullObject = NullObject;

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NumberObject {
    constructor(numberNode) {
        this.numberNode = numberNode;
    }
    objectTypes() {
        return ["Number"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        return this.numberNode.numberValue;
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.NumberObject = NumberObject;

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringObject {
    constructor(stringNode) {
        this.stringNode = stringNode;
    }
    objectTypes() {
        return ["String"];
    }
    executeString() {
        return this.stringNode.stringValue;
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.StringObject = StringObject;

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_node_1 = require("../nodes/function_node");
const field_node_1 = require("../nodes/field_node");
const literal_node_1 = require("../nodes/literal_node");
class Operator {
    constructor(compilerPlugin, context, left, right) {
        this.compilerPlugin = compilerPlugin;
        if (function_node_1.isFunctionParentNode(left)) {
            this.left = compilerPlugin.getFunctionObject(context, left);
        }
        else if (field_node_1.isFieldParentNode(left)) {
            this.left = compilerPlugin.getFieldObject(context, left);
        }
        else if (literal_node_1.isLiteralNode(left)) {
            this.left = compilerPlugin.getLiteralObject(left);
        }
        else {
            this.left = compilerPlugin.getOperatorObject(context, left);
        }
        if (function_node_1.isFunctionParentNode(right)) {
            this.right = compilerPlugin.getFunctionObject(context, right);
        }
        else if (field_node_1.isFieldParentNode(right)) {
            this.right = compilerPlugin.getFieldObject(context, right);
        }
        else if (literal_node_1.isLiteralNode(right)) {
            this.right = compilerPlugin.getLiteralObject(right);
        }
        else {
            this.right = compilerPlugin.getOperatorObject(context, right);
        }
    }
}
exports.Operator = Operator;

},{"../nodes/field_node":37,"../nodes/function_node":38,"../nodes/literal_node":39}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class AsteriskOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Number"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() * this.right.executeNumber();
        }
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.AsteriskOperator = AsteriskOperator;

},{"../operator":19}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class DoubleAmpersandOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Boolean"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        if (this.left.objectTypes().includes("Boolean") && this.right.objectTypes().includes("Boolean")) {
            return this.left.executeBoolean() && this.right.executeBoolean();
        }
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.DoubleAmpersandOperator = DoubleAmpersandOperator;

},{"../operator":19}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class DoubleVerticalLineOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Boolean"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        if (this.left.objectTypes().includes("Boolean") && this.right.objectTypes().includes("Boolean")) {
            return this.left.executeBoolean() || this.right.executeBoolean();
        }
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.DoubleVerticalLineOperator = DoubleVerticalLineOperator;

},{"../operator":19}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class EqualOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Boolean"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        if (this.left.objectTypes().includes("Boolean") && this.right.objectTypes().includes("Boolean")) {
            return this.left.executeBoolean() == this.right.executeBoolean();
        }
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() == this.right.executeNumber();
        }
        if (this.left.objectTypes().includes("Null") && this.right.objectTypes().includes("Null")) {
            return this.left.executeNull() == this.right.executeNull();
        }
        if (this.left.objectTypes().includes("String") && this.right.objectTypes().includes("String")) {
            return this.left.executeString() == this.right.executeString();
        }
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.EqualOperator = EqualOperator;

},{"../operator":19}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class GreaterThanOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Boolean"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() > this.right.executeNumber();
        }
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.GreaterThanOperator = GreaterThanOperator;

},{"../operator":19}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class GreaterThanOrEqualOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Boolean"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() >= this.right.executeNumber();
        }
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.GreaterThanOrEqualOperator = GreaterThanOrEqualOperator;

},{"../operator":19}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class LessThanOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Boolean"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() < this.right.executeNumber();
        }
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.LessThanOperator = LessThanOperator;

},{"../operator":19}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class LessThanOrEqualOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Boolean"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() <= this.right.executeNumber();
        }
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.LessThanOrEqualOperator = LessThanOrEqualOperator;

},{"../operator":19}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class MinusOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Number"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() - this.right.executeNumber();
        }
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.MinusOperator = MinusOperator;

},{"../operator":19}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class NotEqualOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Boolean"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        if (this.left.objectTypes().includes("Boolean") && this.right.objectTypes().includes("Boolean")) {
            return this.left.executeBoolean() != this.right.executeBoolean();
        }
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() != this.right.executeNumber();
        }
        if (this.left.objectTypes().includes("Null") && this.right.objectTypes().includes("Null")) {
            return this.left.executeNull() != this.right.executeNull();
        }
        if (this.left.objectTypes().includes("String") && this.right.objectTypes().includes("String")) {
            return this.left.executeString() != this.right.executeString();
        }
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.NotEqualOperator = NotEqualOperator;

},{"../operator":19}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class PercentOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Number"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() % this.right.executeNumber();
        }
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.PercentOperator = PercentOperator;

},{"../operator":19}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class PlusOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return ["Number"];
        }
        return ["String"];
    }
    executeString() {
        let leftString;
        if (this.left.objectTypes().includes("String")) {
            leftString = this.left.executeString();
        }
        else if (this.left.objectTypes().includes("Boolean")) {
            leftString = String(this.left.executeBoolean());
        }
        else if (this.left.objectTypes().includes("Number")) {
            leftString = String(this.left.executeNumber());
        }
        else {
            leftString = String(this.left.executeNull());
        }
        let rightString;
        if (this.right.objectTypes().includes("String")) {
            rightString = this.right.executeString();
        }
        else if (this.right.objectTypes().includes("Boolean")) {
            rightString = String(this.right.executeBoolean());
        }
        else if (this.right.objectTypes().includes("Number")) {
            rightString = String(this.right.executeNumber());
        }
        else {
            rightString = String(this.right.executeNull());
        }
        return leftString + rightString;
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() + this.right.executeNumber();
        }
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.PlusOperator = PlusOperator;

},{"../operator":19}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operator_1 = require("../operator");
class SlashOperator extends operator_1.Operator {
    constructor(compilerPlugin, context, left, right) {
        super(compilerPlugin, context, left, right);
        this.compilerPlugin = compilerPlugin;
    }
    objectTypes() {
        return ["Number"];
    }
    executeString() {
        throw new Error("Method not implemented.");
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        if (this.left.objectTypes().includes("Number") && this.right.objectTypes().includes("Number")) {
            return this.left.executeNumber() / this.right.executeNumber();
        }
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.SlashOperator = SlashOperator;

},{"../operator":19}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TextObject {
    constructor(textNode) {
        this.textNode = textNode;
    }
    objectTypes() {
        return ["String"];
    }
    executeString() {
        return this.textNode.text;
    }
    executeBoolean() {
        throw new Error("Method not implemented.");
    }
    executeNumber() {
        throw new Error("Method not implemented.");
    }
    executeNull() {
        throw new Error("Method not implemented.");
    }
}
exports.TextObject = TextObject;

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("./compilers/compiler");
function format(jfol, json) {
    const compiler = new compiler_1.Compiler();
    return compiler.format(jfol, json);
}
exports.format = format;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const form = document.getElementsByName("formatter")[0];
form.getElementsByTagName("input")[0].onclick = function () {
    const json = form.getElementsByTagName("textarea")[0].value;
    const jfol = form.getElementsByTagName("textarea")[1].value;
    const text = format(jfol, json);
    form.getElementsByTagName("textarea")[2].value = text;
};

},{"./compilers/compiler":2}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Lexer {
    analyzeToken(source) {
        const tokens = [];
        const rawTokens = this.analyzeRawToken(source);
        for (let i = 0; i < rawTokens.length; i++) {
            const currentToken = rawTokens[i];
            let nextToken;
            if (i + 1 < rawTokens.length) {
                nextToken = rawTokens[i + 1];
            }
            else {
                nextToken = null;
            }
            switch (currentToken.type) {
                case "BackSlash":
                    if (nextToken != null && this.isEscapable(nextToken)) {
                        tokens.push({
                            rawText: this.getEscapedText(nextToken),
                            type: "Text"
                        });
                        i += 1;
                        continue;
                    }
                    else {
                        throw Error("next token is unescapable");
                    }
                case "Dollar":
                    if (nextToken != null && nextToken.type == "Dollar") {
                        tokens.push({
                            rawText: currentToken.rawText + nextToken.rawText,
                            type: "DoubleDollar"
                        });
                        i += 1;
                        continue;
                    }
                    else {
                        tokens.push({
                            rawText: currentToken.rawText,
                            type: "Dollar"
                        });
                    }
                    break;
                default:
                    tokens.push({
                        rawText: currentToken.rawText,
                        type: currentToken.type
                    });
                    break;
            }
        }
        return tokens;
    }
    isEscapable(rawToken) {
        switch (rawToken.type) {
            case "Dollar":
            case "LeftParenthesis":
            case "RightParenthesis":
            case "LeftSquareBracket":
            case "RightSquareBracket":
            case "BackSlash":
            case "DoubleQuotation":
                return true;
            case "Text":
                if (rawToken.rawText.length == 0) {
                    return false;
                }
                switch (rawToken.rawText[0]) {
                    case "0":
                    case "b":
                    case "f":
                    case "n":
                    case "r":
                    case "t":
                    case "v":
                        return true;
                    default:
                        return false;
                }
            default:
                return false;
        }
    }
    getEscapedText(rawToken) {
        switch (rawToken.type) {
            case "Dollar":
            case "LeftParenthesis":
            case "RightParenthesis":
            case "LeftSquareBracket":
            case "RightSquareBracket":
            case "BackSlash":
            case "DoubleQuotation":
                return rawToken.rawText;
            case "Text":
                if (rawToken.rawText.length == 0) {
                    throw Error("internal lexer error");
                }
                switch (rawToken.rawText[0]) {
                    case "0":
                        return `\0${rawToken.rawText.substring(1)}`;
                    case "b":
                        return `\b${rawToken.rawText.substring(1)}`;
                    case "f":
                        return `\f${rawToken.rawText.substring(1)}`;
                    case "n":
                        return `\n${rawToken.rawText.substring(1)}`;
                    case "r":
                        return `\r${rawToken.rawText.substring(1)}`;
                    case "t":
                        return `\t${rawToken.rawText.substring(1)}`;
                    case "v":
                        return `\v${rawToken.rawText.substring(1)}`;
                    default:
                        throw Error("internal lexer error");
                }
            default:
                throw Error("internal lexer error");
        }
    }
    analyzeRawToken(source) {
        const tokens = [];
        let text = "";
        const addRawTextIfNeeded = () => {
            if (text.length != 0) {
                tokens.push({ rawText: text, type: "Text" });
            }
            text = "";
        };
        for (const c of source) {
            switch (c) {
                case "$":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Dollar" });
                    break;
                case "(":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "LeftParenthesis" });
                    break;
                case ")":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "RightParenthesis" });
                    break;
                case "[":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "LeftSquareBracket" });
                    break;
                case "]":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "RightSquareBracket" });
                    break;
                case ".":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Dot" });
                    break;
                case "\\":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "BackSlash" });
                    break;
                case ":":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Colon" });
                    break;
                case ";":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "SemiColon" });
                    break;
                case ",":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Comma" });
                    break;
                case " ":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Space" });
                    break;
                case '"':
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "DoubleQuotation" });
                    break;
                case "=":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Equal" });
                    break;
                case "+":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Plus" });
                    break;
                case "-":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Minus" });
                    break;
                case "/":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Slash" });
                    break;
                case "*":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Asterisk" });
                    break;
                case "%":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Percent" });
                    break;
                case "!":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Bang" });
                    break;
                case "&":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "Ampersand" });
                    break;
                case "|":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "VerticalLine" });
                    break;
                case "<":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "LessThan" });
                    break;
                case ">":
                    addRawTextIfNeeded();
                    tokens.push({ rawText: c, type: "GreaterThan" });
                    break;
                default:
                    text += c;
                    break;
            }
        }
        addRawTextIfNeeded();
        return tokens;
    }
}
exports.Lexer = Lexer;

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isExpressionNode(arg) {
    return arg.expression !== undefined;
}
exports.isExpressionNode = isExpressionNode;

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFieldNode(arg) {
    return arg.fieldIdentifier !== undefined;
}
exports.isFieldNode = isFieldNode;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFieldParentNode(arg) {
    return arg.fieldNodes !== undefined;
}
exports.isFieldParentNode = isFieldParentNode;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFieldParentNodeWithBody(arg) {
    return arg.fieldBodies !== undefined;
}
exports.isFieldParentNodeWithBody = isFieldParentNodeWithBody;

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFunctionNode(arg) {
    return arg.functionIdentifier !== undefined;
}
exports.isFunctionNode = isFunctionNode;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFunctionParentNode(arg) {
    return arg.functionNodes !== undefined;
}
exports.isFunctionParentNode = isFunctionParentNode;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFunctionParentNodeWithArgument(arg) {
    return arg.functionNodes !== undefined && arg.functionArguments !== undefined;
}
exports.isFunctionParentNodeWithArgument = isFunctionParentNodeWithArgument;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFunctionParentNodeWithBody(arg) {
    return arg.functionNodes !== undefined && arg.functionBodies !== undefined;
}
exports.isFunctionParentNodeWithBody = isFunctionParentNodeWithBody;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFunctionParentNodeWithArgumentAndBody(arg) {
    return arg.functionNodes !== undefined && arg.functionArguments !== undefined && arg.functionBodies !== undefined;
}
exports.isFunctionParentNodeWithArgumentAndBody = isFunctionParentNodeWithArgumentAndBody;

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isStringNode(arg) {
    return arg.stringValue !== undefined;
}
exports.isStringNode = isStringNode;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isBooleanNode(arg) {
    return arg.booleanValue !== undefined;
}
exports.isBooleanNode = isBooleanNode;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNumberNode(arg) {
    return arg.numberValue !== undefined;
}
exports.isNumberNode = isNumberNode;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNullNode(arg) {
    return arg.nullValue !== undefined;
}
exports.isNullNode = isNullNode;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isLiteralNode(arg) {
    return isStringNode(arg) || isBooleanNode(arg) || isNumberNode(arg) || isNullNode(arg);
}
exports.isLiteralNode = isLiteralNode;

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isOperatorNode(arg) {
    return arg.operator !== undefined;
}
exports.isOperatorNode = isOperatorNode;

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isTextNode(arg) {
    return arg.text !== undefined;
}
exports.isTextNode = isTextNode;

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const field_node_1 = require("../nodes/field_node");
const function_node_1 = require("../nodes/function_node");
const operator_node_1 = require("../nodes/operator_node");
const literal_node_1 = require("../nodes/literal_node");
const expression_node_1 = require("../nodes/expression_node");
function operatorLevel(operatorNode) {
    switch (operatorNode.operator) {
        case "*":
        case "/":
        case "%":
            return 6;
        case "+":
        case "-":
            return 5;
        case "<":
        case "<=":
        case ">":
        case ">=":
            return 4;
        case "==":
        case "!=":
            return 3;
        case "&&":
            return 2;
        case "||":
            return 1;
        default:
            throw Error("internal operator level error");
    }
}
class Analyzer {
    analyze(parentNode) {
        const nodes = [];
        for (const node of parentNode.nodes) {
            nodes.push(this.childAnalyze(node));
        }
        return { nodes: nodes };
    }
    childAnalyze(node) {
        if (function_node_1.isFunctionParentNodeWithArgumentAndBody(node) == true) {
            const functionParentNode = node;
            const functionArguments = [];
            const functionBodies = [];
            for (const functionArgument of functionParentNode.functionArguments) {
                functionArguments.push(this.convertToReversePolishNotation(functionArgument));
            }
            for (const functionBody of functionParentNode.functionBodies) {
                functionBodies.push(this.childAnalyze(functionBody));
            }
            return {
                functionNodes: functionParentNode.functionNodes,
                functionArguments: functionArguments,
                functionBodies: functionBodies
            };
        }
        if (function_node_1.isFunctionParentNodeWithArgument(node) == true) {
            const functionParentNode = node;
            const functionArguments = [];
            for (const functionArgument of functionParentNode.functionArguments) {
                functionArguments.push(this.convertToReversePolishNotation(functionArgument));
            }
            return {
                functionNodes: functionParentNode.functionNodes,
                functionArguments: functionArguments
            };
        }
        if (function_node_1.isFunctionParentNodeWithBody(node) == true) {
            const functionParentNode = node;
            const functionBodies = [];
            for (const functionBody of functionParentNode.functionBodies) {
                functionBodies.push(this.childAnalyze(functionBody));
            }
            return {
                functionNodes: functionParentNode.functionNodes,
                functionBodies: functionBodies
            };
        }
        if (field_node_1.isFieldParentNodeWithBody(node) == true) {
            const fieldParentNode = node;
            const fieldBodies = [];
            for (const fieldBody of fieldParentNode.fieldBodies) {
                fieldBodies.push(this.childAnalyze(fieldBody));
            }
            return {
                fieldNodes: fieldParentNode.fieldNodes,
                fieldBodies: fieldBodies
            };
        }
        return node;
    }
    // Result Format: Operator, Value, Value
    convertToReversePolishNotation(expressionNode) {
        if (expressionNode.expression.length == 1) {
            return expressionNode;
        }
        if (expressionNode.expression.length == 3) {
            return {
                expression: [expressionNode.expression[1], expressionNode.expression[0], expressionNode.expression[2]]
            };
        }
        const operatorStack = [];
        const reversePolishNotation = [];
        for (const node of expressionNode.expression) {
            if (function_node_1.isFunctionParentNode(node) || field_node_1.isFieldParentNode(node) || literal_node_1.isLiteralNode(node)) {
                reversePolishNotation.push(node);
            }
            else if (expression_node_1.isExpressionNode(node)) {
                reversePolishNotation.push(this.convertToReversePolishNotation(node));
            }
            else if (operator_node_1.isOperatorNode(node)) {
                const currentOperatorLevel = operatorLevel(node);
                let firstOperatorLevel;
                if (operatorStack.length != 0) {
                    firstOperatorLevel = operatorLevel(operatorStack[0]);
                }
                else {
                    firstOperatorLevel = 0; // min level
                }
                while (currentOperatorLevel < firstOperatorLevel) {
                    const tempOperator = operatorStack.shift();
                    if (tempOperator == undefined) {
                        break;
                    }
                    reversePolishNotation.push(tempOperator);
                    if (operatorStack.length != 0) {
                        firstOperatorLevel = operatorLevel(operatorStack[0]);
                    }
                    else {
                        firstOperatorLevel = 0; // min level
                    }
                }
                operatorStack.unshift(node);
            }
            else {
                throw Error("internal parser error");
            }
        }
        for (const operator of operatorStack) {
            reversePolishNotation.push(operator);
        }
        const result = { expression: [] };
        for (const node of reversePolishNotation) {
            if (operator_node_1.isOperatorNode(node) == false) {
                result.expression.unshift(node);
                continue;
            }
            // firstValue(a.k.a left) will be second on stack
            const secondValue = result.expression.shift();
            const firstValue = result.expression.shift();
            result.expression.unshift({ expression: [node, firstValue, secondValue] });
        }
        // result will be single ExpressionNode
        if (result.expression.length != 1) {
            throw Error("internal analyzer error");
        }
        if (expression_node_1.isExpressionNode(result.expression[0]) == false) {
            throw Error("internal analyzer error, cannot read reverse polish notation");
        }
        this.checkExpression(result.expression[0]);
        return result.expression[0];
    }
    checkExpression(expressionNode) {
        const isValueNode = (x) => {
            return field_node_1.isFieldParentNode(x) || function_node_1.isFunctionParentNode(x) || literal_node_1.isLiteralNode(x) || expression_node_1.isExpressionNode(x);
        };
        if (expressionNode.expression.length == 1) {
            if (isValueNode(expressionNode.expression[0]) == false) {
                throw Error("internal analyzer error, not single value");
            }
            return;
        }
        if (expressionNode.expression.length != 3) {
            throw Error("internal analyzer error, not three elements");
        }
        const operator = expressionNode.expression[0];
        const firstValue = expressionNode.expression[1];
        const secondValue = expressionNode.expression[2];
        if (operator_node_1.isOperatorNode(operator) == false) {
            throw Error("internal analyzer error, first expression element not be operator");
        }
        if (isValueNode(firstValue) == false) {
            throw Error("internal analyzer error, second expression element not be value");
        }
        if (isValueNode(secondValue) == false) {
            throw Error("internal analyzer error, third expression element not be value");
        }
        if (expression_node_1.isExpressionNode(firstValue)) {
            this.checkExpression(firstValue);
        }
        if (expression_node_1.isExpressionNode(secondValue)) {
            this.checkExpression(secondValue);
        }
    }
}
exports.Analyzer = Analyzer;

},{"../nodes/expression_node":36,"../nodes/field_node":37,"../nodes/function_node":38,"../nodes/literal_node":39,"../nodes/operator_node":40}]},{},[34]);
