import { Token } from "../tokens/token";
import { RawToken } from "./raw_token";

export class Lexer {
    analyzeToken(source: string): Token[] {
        const tokens: Token[] = [];
        const rawTokens: RawToken[] = this.analyzeRawToken(source);

        for (let i = 0; i < rawTokens.length; i++) {
            const currentToken = rawTokens[i];
            let nextToken: RawToken | null;
            if (i + 1 < rawTokens.length) {
                nextToken = rawTokens[i + 1];
            } else {
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
                    } else {
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
                    } else {
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

    private isEscapable(rawToken: RawToken): boolean {
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

    private getEscapedText(rawToken: RawToken): string {
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

    private analyzeRawToken(source: string): RawToken[] {
        const tokens: RawToken[] = [];

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
                case "\r":
                case "\n":
                    addRawTextIfNeeded();
                    text += c;
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
