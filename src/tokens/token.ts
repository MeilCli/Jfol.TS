import { TokenType } from "./token_type";

export interface Token {
    readonly rawText: string;
    readonly type: TokenType;
}
